import { Request, Response } from "express";
import examinationModel from "../models/examinationModel";
import { AuthenticatedTeacher } from "../models/teacherModel";
import questionBankModel from "../models/questionBankModel";
import { AuthenticatedStudent } from "../models/studentModel";
import { ConcurrentJobQueue } from "../utils/DataQueue";
import CandidateResponses, { IResponses } from "../models/candidateResponses";

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

export const viewExamination = async (req: Request, res: Response) => {
  const examination = await examinationModel.findById(req.query.id);

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

export const fetchQuestions = async (
  req: AuthenticatedStudent,
  res: Response,
) => {
  try {
    const examination = await examinationModel.findOne({ _id: req.query.id });

    if (!examination) {
      return res.status(400).send("Examination not found");
    }

    const questionBank = await questionBankModel.findOne({
      examination: req.query.id,
    });

    if (!questionBank) {
      return res.status(400).send("Question bank not found");
    }

    const filteredQuestions = questionBank.questions.filter(
      (question) =>
        question.classCategory.toLowerCase() ===
        req.student?.classCategory.toLowerCase(),
    );

    if (filteredQuestions.length === 0) {
      return res.status(400).send("No questions for your class category");
    }

    const examQuestions = shuffleArray(filteredQuestions).map((q) => ({
      _id: q._id,
      question: q.question,
      options: shuffleArray(q.options),
    }));

    res.send({
      questions: examQuestions,
      examination,
    });
  } catch (error) {
    res.sendStatus(500);
  }
};

export const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const responseQueue = new ConcurrentJobQueue({
  concurrency: 5,
  maxQueueSize: 10,
  retries: 3,
  retryDelay: 1000,
  shutdownTimeout: 30000,
});

export const saveResponses = async (
  req: AuthenticatedStudent,
  res: Response,
) => {
  try {
    if (!req.student) {
      return res.sendStatus(401);
    }

    const body: IResponses = {
      ...req.body,
      student: req.student._id,
      questionCategory: req.student.classCategory,
    };

    responseQueue.enqueue(async () => {
      await handleAssessmentScore(body);
    });
    res.status(202).send("Responses saved successfully");
  } catch (error) {
    res.sendStatus(500);
  }
};

export const handleAssessmentScore = async (body: IResponses) => {
  try {
    const questionBank = await questionBankModel.findOne({
      examination: body.examination,
    });

    if (!questionBank) return;

    const filteredQuestions = questionBank.questions.filter(
      (question) =>
        question.classCategory.toLowerCase() ===
        body.questionCategory.toLowerCase(),
    );

    const questionMap = new Map(
      filteredQuestions.map((q: any) => [q._id.toString(), q.correctAnswer]),
    );

    let correct = 0;

    for (const answer of body.answers) {
      if (questionMap.get(answer.questionId) === answer.selectedOption) {
        correct++;
      }
    }

    const score = Math.round((correct / filteredQuestions.length) * 100);

    await CandidateResponses.findOneAndUpdate(
      {
        examination: body.examination,
        student: body.student,
        questionCategory: body.questionCategory,
      },
      {
        $set: {
          ...body,
          score,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  } catch (error) {
    console.log(error);
  }
};
