//Create Account
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {
  AuthenticatedStudent,
  IStudent,
  StudentModel,
} from "../models/studentModel";
import { ConcurrentJobQueue } from "../utils/DataQueue";
import { sendEmailFunc } from "../utils/mailController";
import { notificationEmailTemplate } from "./emailTemplate";
import { generateRefreshToken, generateToken, tokens } from "./jwtController";

const queue = new ConcurrentJobQueue(4, 10);
export const createAccount = async (req: Request, res: Response) => {
  try {
    const body: IStudent = req.body;

    const existing = await StudentModel.findOne({
      $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
    });

    if (existing) {
      return res.status(400).send("Account already exists");
    }

    res.send("Account is being created");
    queue
      .enqueue(async () => {
        const student = new StudentModel(body);
        await student.save();

        const activationLink = `http://localhost:5173/activate/${student._id}`;

        await sendEmailFunc(
          student.email,
          "Activate your account",
          notificationEmailTemplate(
            `${student.firstName} ${student.lastName}`,
            activationLink
          )
        );
      })
      .then(() => {
        // res.status(200).send("Account created successfully");
      })
      .catch((err) => {
        console.error("Queue job failed:", err);
        // res.status(500).send("Error creating account");
      });
  } catch (error) {
    console.error("Request error:", error);
    res.status(500).send("Internal server error");
  }
};

//Verify Email

//Verify Account

//Login
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
      });

      const refreshToken = generateRefreshToken({
        _id: existing._id,
        email: existing.email,
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

//Change Password

//Delete Account

//Get Account Details

//Update Account Details

//Get All Accounts

//Delete Account

//Update Account

//Get Account
export const myProfile = async (req: AuthenticatedStudent, res: Response) => {
  res.send(req.student);
};

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
