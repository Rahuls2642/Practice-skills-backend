import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


const cleanJSON = (raw: string): string => {
  let cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();


  const start = cleaned.indexOf("[");
  if (start === -1) throw new Error("No JSON array found in response");

  let depth = 0;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "[") depth++;
    else if (cleaned[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) throw new Error("Unclosed JSON array in response");

  return cleaned.substring(start, end + 1);
};


const safeParseJSON = <T>(raw: string | null): T => {
  if (!raw) throw new Error("Empty response from AI");
  const cleaned = cleanJSON(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(`Failed to parse AI response as JSON.\nRaw: ${cleaned}`);
  }
};


const callWithRetry = async (
  prompt: string,
  retries = 2
): Promise<object[]> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a JSON generator. You ONLY output valid JSON arrays. No prose, no markdown, no code fences, no extra text. Your entire response must be a single valid JSON array starting with [ and ending with ].",
          },
          { role: "user", content: prompt },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,                  
      });

      const raw = response.choices[0].message.content;
      return safeParseJSON<object[]>(raw);
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`JSON parse failed, retrying... (attempt ${attempt + 1})`);
    }
  }
  return [];
};


export const generateQuestions = async (skill: string, type: string) => {
  let prompt = "";

  if (type === "mcq") {
    prompt = `Generate exactly 3 MCQ questions about "${skill}".

Output a single JSON array with this exact structure:
[
  {
    "type": "mcq",
    "question": "What is X?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }
]

Rules:
- answer must exactly match one of the options
- output ONLY the JSON array, nothing else`;
  }

  if (type === "coding") {
    prompt = `Generate exactly 3 coding questions about "${skill}".

Output a single JSON array with this exact structure:
[
  {
    "type": "coding",
    "question": "Write a function that does X",
    "testCases": [
      { "input": "example input as plain string", "output": "expected output as plain string" },
      { "input": "example input as plain string", "output": "expected output as plain string" }
    ]
  }
]

Rules:
- testCases input and output must be plain strings, not objects or arrays
- every question must have a "testCases" key
- output ONLY the JSON array, nothing else`;
  }

  if (type === "interview") {
    prompt = `Generate exactly 3 interview questions about "${skill}".

Output a single JSON array with this exact structure:
[
  {
    "type": "interview",
    "question": "Explain concept X",
    "answer": "Short 1-2 sentence explanation"
  }
]

Rules:
- output ONLY the JSON array, nothing else`;
  }

  return await callWithRetry(prompt);
};

// Feedback
export const getFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<string> => {
  const prompt = `
Question: ${question}
User Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Give:
- Correct or incorrect
- Very short explanation (1-2 lines)
- Simple improvement tip

Keep it simple. No long explanations.
`;

  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });

  return response.choices[0].message.content ?? "";
};