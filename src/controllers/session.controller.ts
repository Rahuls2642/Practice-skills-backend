import { Request, Response } from "express";
import Session from "../models/Session";
import Question from "../models/Question";
import { AuthRequest } from "../middleware/auth.middleware";
import { getFeedback } from "../services/ai.services";
import { runCode } from "../services/codeExecution.services";


export const startSession = async (req: AuthRequest, res: Response) => {
  try {
    const { skills, type } = req.body;

    const query: any = {
      skill: { $in: skills },
    };

    if (type !== "mixed") {
      query.type = type;
    }

    const questions = await Question.find(query).limit(10);

    const session = await Session.create({
      userId: req.user.id,
      skills,
      type,
      questions: questions.map((q) => q._id),
      answers: [],
    });

    res.status(201).json({
      sessionId: session._id,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const submitAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, questionId, answer, language } = req.body;

    if (!sessionId || !questionId || !answer) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

  
  
    if (question.type === "coding") {
      const results = [];

      if (!answer.includes("function solution")) {
        return res.json({
          correct: false,
          error: "Define function solution(input)",
        });
      }

      for (const testCase of question.testCases || []) {
        const wrappedCode = `
${answer}

try {
  const input = ${JSON.stringify(testCase.input)};
  const result = solution(input);
  console.log(result);
} catch (e) {
  console.log("ERROR");
}
`;

        let output;

        try {
          output = await runCode(wrappedCode, language);
        } catch (err) {
          return res.json({
            correct: false,
            error: "Execution failed",
          });
        }

        console.log("RAW OUTPUT:", output);

        const actual =
          output.stdout?.trim() ||
          output.output?.trim() ||
          "";

        const expected = testCase.output.trim();

        const passed = actual === expected;

        results.push({
          input: testCase.input,
          expected,
          actual,
          passed,
        });
      }

      const allPassed = results.every((r) => r.passed);

   
      session.answers.push({
        questionId,
        answer,
        correct: allPassed,
      });

      await session.save();

      return res.json({
        correct: allPassed,
        results,
      });
    }

    let isCorrect = false;

    if (question.answer && answer) {
      isCorrect =
        question.answer.toLowerCase().trim() ===
        answer.toLowerCase().trim();
    }

    session.answers.push({
      questionId,
      answer,
      correct: isCorrect,
    });

    await session.save();

    const feedback = await getFeedback(
      question.question,
      answer,
      question.answer || ""
    );

    return res.json({
      correct: isCorrect,
      correctAnswer: question.answer || null,
      aiFeedback: feedback,
    });
  } catch (error: any) {
    console.error("Submit Answer Error:", error.message);

    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};