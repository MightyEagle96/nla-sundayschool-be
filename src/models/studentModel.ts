import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";
import { Request } from "express";
export interface IStudent {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isConfirmed: boolean;
  phoneNumber: string;
  classCategory: Types.ObjectId;
  classData: Types.ObjectId;
  title: string;
  gender: string;
  role: string;
  disabled: boolean;
}

export interface AuthenticatedStudent extends Request {
  //  student: Partial<IStudent>;
  student?: IStudent;
}

const studentSchema = new Schema<IStudent>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    isConfirmed: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true, trim: true },
    classCategory: { type: Schema.Types.ObjectId, ref: "ClassCategory" },
    classData: { type: Schema.Types.ObjectId, ref: "Class" },
    role: { type: String, default: "student" },
    // title: { type: String, required: true },
    gender: { type: String, required: true },

    disabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

studentSchema.index({ phoneNumber: 1 }, { unique: true });

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const StudentModel = model<IStudent>("Student", studentSchema);
