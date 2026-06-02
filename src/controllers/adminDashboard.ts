import { Request, Response } from "express";
import { StudentModel } from "../models/studentModel";
import { TeacherModel } from "../models/teacherModel";
import ClassModel, { IClass } from "../models/classModel";
import ClassCategoryModel from "../models/classCategoryModel";
import CandidateResponses from "../models/candidateResponses";

export const adminDashboard = async (req: Request, res: Response) => {
  try {
    const [students, teachers] = await Promise.all([
      StudentModel.countDocuments(),
      TeacherModel.countDocuments(),
    ]);

    res.send({
      students,
      teachers,
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
    const classCategories = await ClassCategoryModel.find().sort({ name: 1 });
    res.send(classCategories);
  } catch (error) {
    res.sendStatus(500);
  }
};

export const viewClassesForm = async (req: Request, res: Response) => {
  try {
    const classes = await ClassModel.find(req.query)
      .populate("classCategory", {
        name: 1,
      })
      .lean()
      .sort({ name: 1 });

    const mappedResults = classes.map((c, i) => {
      return {
        ...c,
        id: i + 1,
      };
    });

    res.send(mappedResults);
  } catch (error) {
    res.sendStatus(500);
  }
};

export const viewClasses = async (req: Request, res: Response) => {
  try {
    const classes = await ClassModel.aggregate([
      {
        $match: req.query,
      },

      {
        $lookup: {
          from: "classcategories",
          localField: "classCategory",
          foreignField: "_id",
          as: "classCategory",
        },
      },

      {
        $unwind: {
          path: "$classCategory",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "students",
          let: { classId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$classData", "$$classId"],
                },
              },
            },

            {
              $count: "count",
            },
          ],
          as: "studentCount",
        },
      },

      {
        $addFields: {
          totalStudents: {
            $ifNull: [
              {
                $arrayElemAt: ["$studentCount.count", 0],
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          studentCount: 0,
        },
      },

      {
        $sort: {
          name: 1,
        },
      },
    ]);

    const mappedResults = classes.map((c, i) => {
      return {
        ...c,
        id: i + 1,
      };
    });

    res.send(mappedResults);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
export const viewExamResults = async (req: Request, res: Response) => {
  try {
    const page = (req.query.page || 1) as number;
    const limit = (req.query.limit || 50) as number;
    const results = await CandidateResponses.find({
      examination: req.query.examination,
    })
      .populate("student", { firstName: 1, lastName: 1 })
      .populate("questionCategory", { name: 1 })
      .select({ answers: 0 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await CandidateResponses.countDocuments({
      examination: req.query.examination,
    });

    const mappedResults = results.map((c, i) => {
      return {
        ...c,
        id: (page - 1) * limit + i + 1,
      };
    });
    res.send({ results: mappedResults, total, page, limit });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const viewClass = async (req: Request, res: Response) => {
  try {
    const [classData, students] = await Promise.all([
      ClassModel.findById(req.query.class),
      StudentModel.find({ classData: req.query.class })
        .sort({ firstName: 1, lastName: 1 })
        .lean(),
    ]);

    res.send({
      classData,
      students,
    });
  } catch (error) {}
};
