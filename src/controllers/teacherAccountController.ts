import { Request, Response } from "express";
import { ConcurrentJobQueue } from "../utils/DataQueue";
import {
  AuthenticatedTeacher,
  ITeacher,
  TeacherModel,
} from "../models/teacherModel";
import bcrypt from "bcrypt";
import { generateRefreshToken, generateToken, tokens } from "./jwtController";
import ClassCategoryModel from "../models/classCategoryModel";
import ClassModel from "../models/classModel";
import { StudentModel } from "../models/studentModel";
import CandidateResponses from "../models/candidateResponses";

const accountQueue = new ConcurrentJobQueue({
  concurrency: 4,
  maxQueueSize: 10,
  retries: 0,
  retryDelay: 0,
  shutdownTimeout: 30000,
});

export const createTeacherAccount = async (req: Request, res: Response) => {
  const existingAccount = await TeacherModel.findOne({
    phoneNumber: req.body.phoneNumber,
  });

  if (existingAccount) {
    return res.status(400).send("Phone number already exists");
  }

  accountQueue.enqueue(async () => {
    try {
      await TeacherModel.create(req.body);
    } catch (error) {
      console.log(error);
    }
  });

  res.send("Account created successfully");
};

export const teacherLoginAccount = async (req: Request, res: Response) => {
  const body: ITeacher = req.body;

  const existing = await TeacherModel.findOne({
    phoneNumber: body.phoneNumber,
  });

  if (!existing) {
    return res.status(400).send("Account not found");
  }

  const accessToken = generateToken({
    _id: existing._id,

    role: "teacher",
  });

  const refreshToken = generateRefreshToken({
    _id: existing._id,

    role: "teacher",
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
};

export const getMyStudents = async (
  req: AuthenticatedTeacher,
  res: Response,
) => {
  try {
    const [classCategory, classData, students] = await Promise.all([
      ClassCategoryModel.findById(req.teacher?.classCategory).lean(),
      ClassModel.findById(req.teacher?.classData).lean(),
      StudentModel.find({ classData: req.teacher?.classData }).lean(),
    ]);

    res.send({
      classCategory,
      classData,
      students,
    });
  } catch (error) {
    res.sendStatus(500);
  }
};

export const myStudentsPerformance = async (
  req: AuthenticatedTeacher,
  res: Response,
) => {
  try {
    const classDataId = req.teacher?.classData;
    const responses = await CandidateResponses.find({
      examination: req.query.examination,
    })
      .select("student score")
      .populate({
        path: "student",
        match: { classData: classDataId }, // filter here
        select: "firstName lastName",
      })
      .lean();

    const filtered = responses
      .filter((r) => r.student) // removes null students (non-matching classData)
      .map((r: any) => ({
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        score: r.score,
      }));

    res.send(filtered);
  } catch (error) {
    res.sendStatus(500);
  }
};
