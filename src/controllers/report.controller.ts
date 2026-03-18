import { Request, Response } from "express";
import Session from "../models/Session";
import Question from "../models/Question";
import { getFeedback } from "../services/ai.services";

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    let correctCount = 0;

    const details = [];

    
    const uniqueAnswersMap = new Map();

    for (const ans of session.answers) {
      uniqueAnswersMap.set(ans.questionId.toString(), ans);
    }

    const uniqueAnswers = Array.from(uniqueAnswersMap.values());

    for (const ans of uniqueAnswers) {
      const question = await Question.findById(ans.questionId);
      if (!question) continue;

      let isCorrect = false;

 
      if (typeof ans.correct === "boolean") {
        isCorrect = ans.correct;
      }
     
      else if (question.answer && ans.answer) {
        isCorrect =
          question.answer.toLowerCase().trim() ===
          ans.answer.toLowerCase().trim();
      }

      if (isCorrect) correctCount++;

      details.push({
        question: question.question,
        type: question.type,
        userAnswer: ans.answer,
        correctAnswer: question.answer || null,
        correct: isCorrect,
      });
    }

    const total = uniqueAnswers.length;

   
    const summaryPrompt = `
User answered ${correctCount} out of ${total} questions correctly.

Give:
- Strengths
- Weaknesses
- What to improve

Keep it short.
`;

    const aiSummary = await getFeedback(
      "Performance Report",
      `${correctCount}/${total}`,
      summaryPrompt
    );

    res.json({
      score: correctCount,
      total,
      percentage:
        total > 0 ? ((correctCount / total) * 100).toFixed(2) : "0.00",
      details,
      summary: aiSummary,
    });
  } catch (error: any) {
    console.error("Report Error:", error.message);

    res.status(500).json({
      message: "Failed to generate report",
      error: error.message,
    });
  }
};