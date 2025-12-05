import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";
import { Request } from "express";
export interface ITeacher {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isConfirmed: boolean;
  phoneNumber: string;
  classCategory: string;
  className: string;
  title: string;
  gender: string;
  role: string;
  adminRights: boolean;
  disabled: boolean;
}

export interface AuthenticatedTeacher extends Request {
  //  student: Partial<ITeacher>;
  teacher?: ITeacher;
}

const teacherSchema = new Schema<ITeacher>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isConfirmed: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true, trim: true, unique: true },
    classCategory: { type: String },
    className: { type: String },
    // title: { type: String, required: true },
    role: { type: String, default: "teacher" },
    gender: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 }, // ✅ enforce length
    adminRights: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const TeacherModel = model<ITeacher>("Teacher", teacherSchema);
