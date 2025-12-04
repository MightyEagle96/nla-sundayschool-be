import { Request, Response } from "express";
import questionBankModel from "../models/questionBankModel";
import { JointInterface } from "./jwtController";
import { AuthenticatedTeacher } from "../models/teacherModel";

export const classCategory = {
  yaya: "yaya",
  adult: "adult",
};

export const createQuestion = async (
  req: AuthenticatedTeacher,
  res: Response
) => {
  try {
    const questionBank = await questionBankModel.findOne({
      examination: req.body.examination,
    });

    if (questionBank) {
      questionBank.questions.push(req.body);
      await questionBank.save();
    } else {
      const newQuestionBank = await questionBankModel.create({
        examination: req.body.examination,
        questions: [req.body],
      });
    }

    res.send("Question created successfully");
  } catch (error) {
    res.sendStatus(500);
  }
};

export const viewQuestionBank = async (req: Request, res: Response) => {
  try {
    const questionBank = await questionBankModel
      .findOne({
        examination: req.query.examination,
      })
      .lean();

    if (questionBank) {
      const mapped = questionBank.questions.map((question, id) => {
        return {
          ...question,
          id: id + 1,
        };
      });

      return res.send(mapped);
    }
    res.send([]);
  } catch (error) {
    res.sendStatus(500);
  }
};
