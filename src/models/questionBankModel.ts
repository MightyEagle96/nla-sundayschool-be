import mongoose, { Types } from "mongoose";
import { classCategory } from "../controllers/questionBankController";

const { Schema, model } = mongoose;

interface IQuestion {
  question: string;
  classCategory: string;
  options: [string];
  correctAnswer: string;
  authoredBy: Types.ObjectId;
}

interface IQuestionBank {
  createdBy: Types.ObjectId;
  isTaken: boolean;
  dateCreated: Date;
  questions: [IQuestion];
  dateTaken: Date;
  bankName: string;
  examination: Types.ObjectId;
}

const schema = new Schema<IQuestionBank>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "Teacher" },
    isTaken: { type: Boolean, default: false },
    dateCreated: { type: Date },
    dateTaken: Date,
    questions: [
      {
        question: String,
        questionId: String,
        options: [String],
        correctAnswer: String,
        classCategory: String,
        authoredBy: { type: Schema.Types.ObjectId, ref: "Teacher" },
      },
    ],
    examination: { type: Schema.Types.ObjectId, ref: "Examination" },
  },
  { timestamps: true }
);

export default model("QuestionBank", schema);
