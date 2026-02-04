import { Schema, Types, model } from "mongoose";

interface IExamination {
  title: string;
  createdBy: Types.ObjectId;
  dateScheduled: Date;
  timeScheduled: Date;
  active: boolean;
  duration: number;
}

const schema = new Schema<IExamination>(
  {
    title: { type: String, unique: true, trim: true, lowercase: true },

    dateScheduled: Date,
    timeScheduled: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "Teacher" },
    active: { type: Boolean, default: false },
    duration: { type: Number, default: 10 },
  },
  { timestamps: true },
);

export default model("Examination", schema);

export { IExamination };
