import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  userId: string;
  skills: string[];
  type: "mcq" | "coding" | "interview" | "mixed";
  questions: mongoose.Types.ObjectId[];
  answers: {
    questionId: mongoose.Types.ObjectId;
    answer: string;
  }[];
  startedAt: Date;
  completedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: String,
      required: true,
    },
    skills: [String],
    type: {
      type: String,
      enum: ["mcq", "coding", "interview", "mixed"],
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
        },
        answer: String,
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;