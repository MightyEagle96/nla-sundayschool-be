import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

interface IQuestion {
  question: string;
  questionId: string;
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
  classCategory: string;
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
        authoredBy: { type: Schema.Types.ObjectId, ref: "Teacher" },
      },
    ],
    classCategory: String,
  },
  { timestamps: true }
);

export default model("QuestionBank", schema);
