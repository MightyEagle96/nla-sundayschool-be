import { Request, Response } from "express";
import examinationModel from "../models/examinationModel";
import { AuthenticatedTeacher } from "../models/teacherModel";
import questionBankModel from "../models/questionBankModel";

export const createExamination = async (
  req: AuthenticatedTeacher,
  res: Response,
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
        { title: req.body.title },
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

// export const viewExaminations = async (req: Request, res: Response) => {
//   const examinations = await examinationModel.find();

//   const mappedExaminations = examinations.map((examination, i) => {
//     return {
//       _id: examination._id,
//       title: examination.title,
//       id: i + 1,
//     };
//   });
//   res.send(mappedExaminations);
// };

export const viewExaminations = async (req: Request, res: Response) => {
  try {
    // Fetch all examinations first
    const examinations = await examinationModel.find();

    // Get all question banks grouped by examination
    const stats = await questionBankModel.aggregate([
      {
        $group: {
          _id: "$examination",
          totalQuestions: { $sum: { $size: "$questions" } },
          adultQuestions: {
            $sum: {
              $size: {
                $filter: {
                  input: "$questions",
                  as: "q",
                  cond: { $eq: ["$$q.classCategory", "adult"] },
                },
              },
            },
          },
          yayaQuestions: {
            $sum: {
              $size: {
                $filter: {
                  input: "$questions",
                  as: "q",
                  cond: { $eq: ["$$q.classCategory", "yaya"] },
                },
              },
            },
          },
        },
      },
    ]);

    // Convert aggregation result to a lookup map
    const statsMap = new Map(
      stats.map((s) => [
        s._id?.toString(),
        {
          totalQuestions: s.totalQuestions,
          adultQuestions: s.adultQuestions,
          yayaQuestions: s.yayaQuestions,
        },
      ]),
    );

    // Combine examination data with stats
    const mapped = examinations.map((exam, index) => {
      const stat = statsMap.get(exam._id.toString()) || {
        totalQuestions: 0,
        adultQuestions: 0,
        yayaQuestions: 0,
      };

      return {
        _id: exam._id,
        title: exam.title,
        id: index + 1,
        duration: exam.duration,
        active: exam.active,
        ...stat,
      };
    });

    res.send(mapped);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const deleteExamination = async (
  req: AuthenticatedTeacher,
  res: Response,
) => {
  await examinationModel.deleteOne({ _id: req.query.id });

  res.send("Examination deleted");
};

export const viewActiveExamination = async (req: Request, res: Response) => {
  const examination = await examinationModel.findOne({ active: true });
  res.send(examination);
};

export const toggleActivation = async (req: Request, res: Response) => {
  try {
    const examination = await examinationModel.findOne({ _id: req.query.id });

    if (!examination) {
      return res.status(400).send("Examination not found");
    }

    await examinationModel.updateMany({}, { active: false });

    examination.active = !examination.active;
    await examination.save();
    res.send("Examination updated successfully");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const updateDuration = async (req: Request, res: Response) => {
  try {
    await examinationModel.updateOne(
      { _id: req.query.id },
      { duration: req.body.duration },
    );
    res.send("Examination updated successfully");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
