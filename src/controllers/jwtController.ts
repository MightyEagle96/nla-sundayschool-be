import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  AuthenticatedStudent,
  IStudent,
  StudentModel,
} from "../models/studentModel";

//dotenv.config();

export const tokens = {
  auth_token: "auth_token",
  refresh_token: "refresh_token",
};

export function generateToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
}

export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, process.env.REFRESH_SECRET as string, {
    expiresIn: "2d",
  });
}

// Middleware to protect routes
export async function authenticateToken(
  req: AuthenticatedStudent,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies[tokens.auth_token];
  if (!token) {
    res.status(401).send("Not authenticated");
    return;
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IStudent;

    const student = await StudentModel.findById(user._id);

    if (!student) {
      res.status(401).send("Not authenticated");
      return;
    }

    req.student = user;

    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}
