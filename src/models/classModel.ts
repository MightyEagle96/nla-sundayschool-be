import { Schema, model } from "mongoose";

export interface IClass {
  name: string;
  classCategory: string;
}

const schema = new Schema<IClass>(
  {
    name: { type: String, lowercase: true },
    classCategory: { type: String, lowercase: true },
  },
  { timestamps: true },
);

const ClassModel = model("Class", schema);
export default ClassModel;
