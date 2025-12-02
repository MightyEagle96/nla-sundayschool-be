import { Schema, model } from "mongoose";

interface IExamination {
  title: string;
  dateScheduled: Date;
  timeScheduled: Date;
}

const schema = new Schema<IExamination>({
  title: String,
  dateScheduled: Date,
  timeScheduled: Date,
});

export default model("Examination", schema);

export { IExamination };
