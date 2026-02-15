import { Request, Response } from "express";
import { StudentModel } from "../models/studentModel";
import { TeacherModel } from "../models/teacherModel";
import ClassModel, { IClass } from "../models/classModel";

export const adultClasses = [
  "grace",
  "mercy",
  "favor",
  "peace",
  "love",
  "goodness",
].sort();

export const yayaClasses = ["glory", "truth", "wisdom"].sort();

export const adminDashboard = async (req: Request, res: Response) => {
  try {
    const [students, teachers] = await Promise.all([
      StudentModel.countDocuments(),
      TeacherModel.countDocuments(),
    ]);

    res.send({
      students,
      teachers,
      adultClasses: adultClasses.length,
      yayaClasses: yayaClasses.length,
    });
  } catch (error) {}
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const body: IClass = req.body;
    const existingClass = await ClassModel.findOne({
      name: body.name,
      classCategory: body.classCategory,
    });

    if (existingClass) {
      throw new Error("Class already exists");
    }

    await ClassModel.create(body);
    res.send("Class created");
  } catch (error: any) {
    console.log(new Error(error));
    res.status(500).send(new Error(error).message);
  }
};
