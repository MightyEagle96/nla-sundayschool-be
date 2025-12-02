import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import {
  AuthenticatedStudent,
  IStudent,
  StudentModel,
} from "../models/studentModel";
import { ITeacher, TeacherModel } from "../models/teacherModel";

dotenv.config();

export const tokens = {
  auth_token: "auth_token",
  refresh_token: "refresh_token",
};

export function generateToken(payload: object) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN as string, {
    expiresIn: "1d",
  });
}

export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN as string, {
    expiresIn: "2d",
  });
}

export interface JointInterface extends Request {
  student?: IStudent;
  teacher?: ITeacher;
}

export async function authenticateToken(
  req: JointInterface,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from cookie
    const token = req.cookies[tokens.auth_token];

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    if (decoded.role === "teacher") {
      const teacher = await TeacherModel.findById(decoded._id).lean();
      if (!teacher) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      req.teacher = teacher;
      next();
      return;
    }

    if (decoded.role === "student") {
      const student = await StudentModel.findById(decoded._id).lean();
      if (!student) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      req.student = student;
      next();
      return;
    }

    if (!decoded?._id) {
      return res.status(403).json({ message: "Invalid token payload" });
    }
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
}
