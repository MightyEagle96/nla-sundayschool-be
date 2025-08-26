import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import {
  AuthenticatedStudent,
  IStudent,
  StudentModel,
} from "../models/studentModel";

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

// Middleware to protect routes
// export async function authenticateToken(
//   req: AuthenticatedStudent,
//   res: Response,
//   next: NextFunction
// ) {

//   const token = req.cookies[`${tokens.auth_token}`];
//   if (!token) {
//     res.status(401).send("Not authenticated");
//     return;
//   }

//   try {
//     const user = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as IStudent;

//     const student = await StudentModel.findById(user._id);

//     if (!student) {
//       res.status(401).send("Not authenticated");
//       return;
//     }

//     req.student = user;

//     next();
//   } catch (err) {
//     res.status(403).json({ message: "Invalid token" });
//   }
// }

export async function authenticateToken(
  req: AuthenticatedStudent,
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
    ) as JwtPayload & IStudent;
    if (!decoded?._id) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    // Check student in DB
    const student = await StudentModel.findById(decoded._id).lean();
    if (!student) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Attach to request
    req.student = student;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
}
