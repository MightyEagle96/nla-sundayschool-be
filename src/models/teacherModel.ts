import { Schema, Types, model } from "mongoose";
import { Request } from "express";
export interface ITeacher {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  isConfirmed: boolean;
  phoneNumber: string;
  title: string;
  gender: string;
  classCategory: Types.ObjectId;
  classData: Types.ObjectId;
  adminRights: boolean;
  role: string;
}

export interface AuthenticatedTeacher extends Request {
  //  student: Partial<ITeacher>;
  teacher?: ITeacher;
}

const teacherSchema = new Schema<ITeacher>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    isConfirmed: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true, trim: true, unique: true },
    classCategory: { type: Schema.Types.ObjectId, ref: "ClassCategory" },
    classData: { type: Schema.Types.ObjectId, ref: "Class" },
    gender: { type: String, required: true },
    role: { type: String, default: "teacher" },
    adminRights: { type: Boolean, default: false },
  },
  { timestamps: true },
);

teacherSchema.index({ phoneNumber: 1 }, { unique: true });

export const TeacherModel = model<ITeacher>("Teacher", teacherSchema);
