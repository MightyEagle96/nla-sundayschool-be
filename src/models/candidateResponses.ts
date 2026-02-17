import { Schema, Types, model } from "mongoose";

export interface IResponses {
  examination: Types.ObjectId;
  student: Types.ObjectId;
  answers: [
    {
      questionId: string;
      selectedOption: string;
    },
  ];
  createdAt: Date;
  updatedAt: Date;
  questionCategory: Types.ObjectId;
  score: number;
}

const schema = new Schema<IResponses>(
  {
    examination: { type: Schema.Types.ObjectId, ref: "Examination" },
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    questionCategory: { type: Schema.Types.ObjectId, ref: "ClassCategory" },
    answers: [
      {
        questionId: String,
        selectedOption: String,
      },
    ],

    score: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const CandidateResponses = model("CandidateResponses", schema);

export default CandidateResponses;
