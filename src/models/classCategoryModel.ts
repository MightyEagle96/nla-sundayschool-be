import { Schema, model } from "mongoose";

export interface IClassCategory {
  name: string;
}

const schema = new Schema<IClassCategory>(
  {
    name: { type: String, lowercase: true },
  },
  { timestamps: true },
);

const ClassCategoryModel = model("ClassCategory", schema);
export default ClassCategoryModel;
