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
  classCategory: string;
  className: string;
  title: string;
  gender: string;
}

export interface AuthenticatedStudent extends Request {
  //  student: Partial<IStudent>;
  student?: IStudent;
}

const studentSchema = new Schema<IStudent>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,

      lowercase: true,
      trim: true,
    },
    isConfirmed: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true, trim: true },
    classCategory: { type: String, required: true },
    className: { type: String, required: true },
    // title: { type: String, required: true },
    gender: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 }, // ✅ enforce length
  },
  { timestamps: true }
);

studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ phoneNumber: 1 }, { unique: true });

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const StudentModel = model<IStudent>("Student", studentSchema);
