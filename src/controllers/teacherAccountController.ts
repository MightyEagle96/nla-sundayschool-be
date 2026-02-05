import { Request, Response } from "express";
import { ConcurrentJobQueue } from "../utils/DataQueue";
import { ITeacher, TeacherModel } from "../models/teacherModel";
import bcrypt from "bcrypt";
import { generateRefreshToken, generateToken, tokens } from "./jwtController";

const accountQueue = new ConcurrentJobQueue({
  concurrency: 4,
  maxQueueSize: 10,
  retries: 0,
  retryDelay: 0,
  shutdownTimeout: 30000,
});

export const teacherCreateAccount = async (req: Request, res: Response) => {
  try {
    const account = await TeacherModel.findOne({
      $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
    });

    if (account) {
      return res.status(400).send("Account already exists");
    }
    accountQueue.enqueue(async () => {
      try {
        await TeacherModel.create(req.body);
      } catch (error) {
        console.log(error);
      }
    });
    res.send("Account created successfully");
  } catch (error) {
    console.error("Queue job failed:", error);
    res.status(500).send("Error creating account");
  }
};

export const teacherLoginAccount = async (req: Request, res: Response) => {
  const body: ITeacher = req.body;

  const existing = await TeacherModel.findOne({
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
        role: "teacher",
      });

      const refreshToken = generateRefreshToken({
        _id: existing._id,
        email: existing.email,
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
    } else {
      res.status(400).send("Invalid credentials");
    }
  });
};
