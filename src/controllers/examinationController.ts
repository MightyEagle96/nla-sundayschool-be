import { Request, Response } from "express";
import examinationModel from "../models/examinationModel";
import { AuthenticatedTeacher } from "../models/teacherModel";

export const createExamination = async (
  req: AuthenticatedTeacher,
  res: Response
) => {
  try {
    const existing = await examinationModel.findOne({ title: req.body.title });

    if (existing) {
      return res.status(400).send("Examination already exists");
    }

    req.body.createdBy = req.teacher?._id;

    if (req.body.examinationId) {
      await examinationModel.updateOne(
        { _id: req.body.examinationId },
        { title: req.body.title }
      );

      res.send("Examination updated successfully");
    } else {
      await examinationModel.create(req.body);
      res.send("Examination created successfully");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const viewExaminations = async (req: Request, res: Response) => {
  const examinations = await examinationModel.find();

  const mappedExaminations = examinations.map((examination, i) => {
    return {
      _id: examination._id,
      title: examination.title,
      id: i + 1,
    };
  });
  res.send(mappedExaminations);
};

export const deleteExamination = async (
  req: AuthenticatedTeacher,
  res: Response
) => {};
