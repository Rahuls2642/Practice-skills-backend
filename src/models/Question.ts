import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  type: "mcq" | "coding" | "interview";
  skill: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  answer?: string;
  language?: string; 
  testCases?: { input: string; output: string }[];
}

const questionSchema = new Schema<IQuestion>(
  {
    type: {
      type: String,
      enum: ["mcq", "coding", "interview"],
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    question: {
      type: String,
      required: true,
    },
    language: {
  type: String,
  enum: ["javascript", "java", "python"],
  required: function (this: IQuestion) {
    return this.type === "coding"; 
  },
},
    options: [String],
    answer: {
      type: String,
    
      required: function (this: IQuestion) {
        return this.type !== "coding";
      },
    },
    testCases: [
      {
        input: Schema.Types.Mixed, 
        output: Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model<IQuestion>("Question", questionSchema);

export default Question;