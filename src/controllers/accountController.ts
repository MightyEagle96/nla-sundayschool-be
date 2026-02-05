//Create Account
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import {
  AuthenticatedStudent,
  IStudent,
  StudentModel,
} from "../models/studentModel";
import { ConcurrentJobQueue } from "../utils/DataQueue";
import { sendEmailFunc } from "../utils/mailController";
import { notificationEmailTemplate } from "./emailTemplate";
import {
  generateRefreshToken,
  generateToken,
  JointInterface,
  tokens,
} from "./jwtController";
import jwt from "jsonwebtoken";
import { AuthenticatedTeacher, TeacherModel } from "../models/teacherModel";

const accountQueue = new ConcurrentJobQueue({
  concurrency: 5,
  maxQueueSize: 10,
  retries: 3,
  retryDelay: 1000,
  shutdownTimeout: 30000,
});

export const createAccount = async (req: Request, res: Response) => {
  const existingAccount = await StudentModel.findOne({
    email: req.body.email,
  });

  if (existingAccount) {
    return res.status(400).send("Account already exists");
  }

  accountQueue.enqueue(async () => {
    try {
      await StudentModel.create(req.body);
    } catch (error) {
      console.log(error);
    }
  });

  res.send("Account created successfully");
};

export const loginAccount = async (req: Request, res: Response) => {
  const body: IStudent = req.body;

  const existing = await StudentModel.findOne({
    $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
  });

  if (!existing) {
    return res.status(400).send("Account not found");
  }

  bcrypt.compare(body.password, existing.password).then((result) => {
    if (result) {
      const accessToken = generateToken({
        _id: existing._id,
        email: existing.email,
        role: "student",
      });

      const refreshToken = generateRefreshToken({
        _id: existing._id,
        email: existing.email,
        role: "student",
      });
      // res.send("Account logged in successfully");
      res
        .cookie(tokens.auth_token, accessToken, {
          httpOnly: false,
          secure: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60, // 1h
        })
        .cookie(tokens.refresh_token, refreshToken, {
          httpOnly: false,
          secure: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
        })
        .send("Logged In");
    } else {
      res.status(400).send("Invalid credentials");
    }
  });
};

export const myProfile = async (req: JointInterface, res: Response) => {
  if (req.student) {
    res.send(req.student);
  }

  if (req.teacher) {
    req.teacher.role === "teacher";
    res.send(req.teacher);
  }
};

export const logoutAccount = async (req: JointInterface, res: Response) => {
  res
    .clearCookie(tokens.auth_token)
    .clearCookie(tokens.refresh_token)
    .send("Logged Out");
};

//Change Password

//Delete Account

//Get Account Details

//Update Account Details

//Get All Accounts

//Delete Account

//Update Account

//Get Account

//Logout
export const logout = async (req: Request, res: Response) => {
  res.clearCookie(tokens.auth_token, {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie(tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.send("Logged Out");
};

export const getRefreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies[tokens.refresh_token];

  if (!refreshToken) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN as string,
    );

    const student = await StudentModel.findById(decoded._id);

    const teacher = await TeacherModel.findById(decoded._id);

    if (student) {
      const accessToken = generateToken({
        _id: student._id,
        email: student.email,
        role: "student",
      });

      const newRefreshToken = generateRefreshToken({
        _id: student._id,
        email: student.email,
        role: "student",
      });

      return res
        .cookie(tokens.auth_token, accessToken, {
          httpOnly: false,
          secure: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60, // 1h
        })
        .cookie(tokens.refresh_token, newRefreshToken, {
          httpOnly: false,
          secure: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
        })
        .send("Logged In");
      //console.log("na here o");
      //return res.status(401).send("Invalid refresh token");
    }

    if (teacher) {
      const accessToken = generateToken({
        _id: teacher._id,
        email: teacher.email,
        role: "teacher",
      });

      const refreshToken = generateRefreshToken({
        _id: teacher._id,
        email: teacher.email,
        role: "teacher",
      });

      return res
        .cookie(tokens.auth_token, accessToken, {
          httpOnly: false,
          secure: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60, // 1h
        })
        .cookie(tokens.refresh_token, refreshToken, {
          httpOnly: false,
          secure: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
        })
        .send("Logged In");
    }

    return res.status(401).send("Invalid refresh token");
  } catch (error) {
    res.status(401).send("Invalid refresh token");
  }
  //  res.send(req.cookies[tokens.refresh_token]);
};

export const restrictToAdmin = (
  req: AuthenticatedTeacher,
  res: Response,
  next: NextFunction,
) => {
  if (req.teacher?.adminRights === false) {
    return res.status(403).send("Not permitted");
  }

  next();
};

//view candidates
export const viewCandidates = async (req: Request, res: Response) => {
  try {
    try {
      const page = (req.query.page || 1) as number;
      const limit = (req.query.limit || 50) as number;
      const candidates = await StudentModel.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await StudentModel.countDocuments();

      const totalCandidates = candidates.map((c, i) => {
        return {
          ...c,
          id: (page - 1) * limit + i + 1,
        };
      });
      res.send({
        candidates: totalCandidates,
        total,
        page,
        limit,
      });
    } catch (error) {
      res.send({
        candidates: [],
        total: 0,
        page: 0,
        limit: 0,
      });
    }
  } catch (error) {
    res.sendStatus(500);
  }
};
