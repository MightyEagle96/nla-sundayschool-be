import { Request, Response } from "express";
import questionBankModel from "../models/questionBankModel";
import { JointInterface } from "./jwtController";

export const createQuestionBank = async (
  req: JointInterface,
  res: Response
) => {
  try {
    req.body.createdBy = req.teacher?._id;
    const questionBank = await questionBankModel.create(req.body);
    res.status(201).json(questionBank);
  } catch (error) {
    res.status(500).json({ error: "Failed to create question bank" });
  }
};

export const classCategory = {
  yaya: "yaya",
  adult: "adult",
};

export const viewQuestionBankCount = async (req: Request, res: Response) => {
  const [adultCount, yayaCount] = await Promise.all([
    questionBankModel.countDocuments({ classCategory: classCategory.adult }),
    questionBankModel.countDocuments({ classCategory: classCategory.yaya }),
  ]);

  res.json({ yayaCount, adultCount });
};
