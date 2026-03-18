import axios from "axios";
import dotenv from "dotenv"
dotenv.config()
export const runCode = async (code: string, language: string) => {
  try {
    const response = await axios.post(
      "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
      {
        language,
        code,
      },
      {
        headers: {
          "X-RapidAPI-Key": process.env.ONECOMPILER_API_KEY,
          "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.log("OneCompiler Error:", error.response?.data || error.message);
    throw new Error("Execution failed");
  }
};