import { Schema, Types, model } from "mongoose";

export interface IClass {
  name: string;
  classCategory: Types.ObjectId;
}

const schema = new Schema<IClass>(
  {
    name: { type: String, lowercase: true },
    classCategory: { type: Schema.Types.ObjectId, ref: "ClassCategory" },
  },
  { timestamps: true },
);

const ClassModel = model("Class", schema);
export default ClassModel;
