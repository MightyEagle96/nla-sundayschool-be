import { Request, Response } from "express";
import examinationModel from "../models/examinationModel";
import { AuthenticatedTeacher } from "../models/teacherModel";

export const createExamination = async (
  req: AuthenticatedTeacher,
  res: Response
) => {
  if (req.teacher?.adminRights === false) {
    return res.status(401).send("Not authorized");
  }
  await examinationModel.create(req.body);
  res.send("Examination created successfully");
};

export const viewExaminations = async (req: Request, res: Response) => {
  const examinations = await examinationModel.find();
  res.send(examinations);
};
