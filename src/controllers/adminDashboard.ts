import { Request, Response } from "express";
import { StudentModel } from "../models/studentModel";
import { TeacherModel } from "../models/teacherModel";
import ClassModel, { IClass } from "../models/classModel";
import ClassCategoryModel from "../models/classCategoryModel";

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

export const classOverview = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    res.sendStatus(500);
  }
};

export const addClassCategory = async (req: Request, res: Response) => {
  try {
    const existingClass = await ClassCategoryModel.findOne({
      name: req.body.name,
    });

    if (existingClass) {
      return res.status(400).send("Class category already exists");
    }

    await ClassCategoryModel.create(req.body);
    res.send("Class category created");
  } catch (error) {
    res.sendStatus(500);
  }
};

export const viewClassCategories = async (req: Request, res: Response) => {
  try {
    const classCategories = await ClassCategoryModel.find();
    res.send(classCategories);
  } catch (error) {
    res.sendStatus(500);
  }
};
