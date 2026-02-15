import { Schema, model } from "mongoose";

export interface IClass {
  name: string;
  classCategory: string;
}

const schema = new Schema<IClass>(
  {
    name: { type: String },
    classCategory: { type: String },
  },
  { timestamps: true },
);

const ClassModel = model("Class", schema);
export default ClassModel;
