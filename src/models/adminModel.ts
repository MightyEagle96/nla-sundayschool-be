import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";
import { Request } from "express";

export interface IAdmin {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthenticatedAdmin extends Request {
  admin?: IAdmin;
}

const adminSchema = new Schema<IAdmin>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,

      lowercase: true,
      trim: true,
    },
    password: String,
    role: { type: String, default: "admin" },
  },
  { timestamps: true },
);

adminSchema.index({ email: 1 }, { unique: true });

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const AdminModel = model<IAdmin>("Admin", adminSchema);

export default AdminModel;
