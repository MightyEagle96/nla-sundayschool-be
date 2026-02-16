import { Request, Response } from "express";
import examinationModel from "../models/examinationModel";
import { AuthenticatedTeacher } from "../models/teacherModel";
import questionBankModel from "../models/questionBankModel";
import { AuthenticatedStudent } from "../models/studentModel";
import { ConcurrentJobQueue } from "../utils/DataQueue";
import CandidateResponses, { IResponses } from "../models/candidateResponses";
import e from "cors";

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

export const viewActiveExamination = async (
  req: AuthenticatedStudent,
  res: Response,
) => {
  if (!req.student) {
    return res.status(403).send("This route is only accessible by students");
  }
  const examination = await examinationModel.findOne({ active: true }).lean();

  if (!examination) {
    return res.status(404).send("No active examination found");
  }

  const hasTakenThisExamination = await CandidateResponses.exists({
    student: req.student._id,
    examination: examination._id,
  });
  res.send({
    ...examination,
    hasTakenThisExamination: hasTakenThisExamination ? true : false,
  });
};

export const viewExamination = async (
  req: AuthenticatedStudent,
  res: Response,
) => {
  if (!req.student) {
    return res.status(403).send("This route is only accessible by students");
  }
  const examination = await examinationModel.findById(req.query.id);

  if (!examination) {
    return res.status(404).send("Examination not found");
  }

  const hasTakenThisExamination = await CandidateResponses.exists({
    student: req.student._id,
    examination: examination._id,
  });

  if (hasTakenThisExamination) {
    return res.status(400).send("You have already taken this examination");
  }

  res.send(examination);
};

export const viewResults = async (req: AuthenticatedStudent, res: Response) => {
  try {
    const responses = await CandidateResponses.find({
      student: req.student?._id,
    })
      .select({ answers: 0 })
      .populate("examination", "title")
      .lean();

    const mapped = responses.map((response, id) => {
      return {
        ...response,
        id: id + 1,
      };
    });
    res.send(mapped);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
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

    // const filteredQuestions = questionBank.questions.filter(
    //   (question) =>
    //     question.classCategory.toLowerCase() ===
    //     req.student?.classCategory.toLowerCase(),
    // );

    // if (filteredQuestions.length === 0) {
    //   return res.status(400).send("No questions for your class category");
    // }

    // const examQuestions = shuffleArray(filteredQuestions).map((q) => ({
    //   _id: q._id,
    //   question: q.question,
    //   options: shuffleArray(q.options),
    // }));

    // res.send({
    //   questions: examQuestions,
    //   examination,
    // });
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
  // try {
  //   const questionBank = await questionBankModel.findOne({
  //     examination: body.examination,
  //   });
  //   if (!questionBank) return;
  //   const filteredQuestions = questionBank.questions.filter(
  //     (question) =>
  //       question.classCategory.toLowerCase() ===
  //       body.questionCategory.toLowerCase(),
  //   );
  //   const questionMap = new Map(
  //     filteredQuestions.map((q: any) => [q._id.toString(), q.correctAnswer]),
  //   );
  //   let correct = 0;
  //   for (const answer of body.answers) {
  //     if (questionMap.get(answer.questionId) === answer.selectedOption) {
  //       correct++;
  //     }
  //   }
  //   const score = Math.round((correct / filteredQuestions.length) * 100);
  //   await CandidateResponses.findOneAndUpdate(
  //     {
  //       examination: body.examination,
  //       student: body.student,
  //       questionCategory: body.questionCategory,
  //     },
  //     {
  //       $set: {
  //         ...body,
  //         score,
  //       },
  //     },
  //     {
  //       upsert: true,
  //       new: true,
  //     },
  //   );
  // } catch (error) {
  //   console.log(error);
  // }
};

export const generateExamTranscript = async ({
  examination,
  student,
  questionCategory,
}: {
  examination: string;
  student: string;
  questionCategory: string;
}) => {
  console.log({
    examination,
    student,
    questionCategory,
  });
  const responseDoc = await CandidateResponses.findOne({
    examination,
    student,
    questionCategory,
  }).lean();

  if (!responseDoc) {
    throw new Error("Candidate response not found");
  }

  const questionBank = await questionBankModel
    .findOne({
      examination,
    })
    .lean();

  if (!questionBank) {
    throw new Error("Question bank not found");
  }

  const questions = questionBank.questions.filter(
    (q: any) =>
      q.classCategory.toLowerCase() === questionCategory.toLowerCase(),
  );

  const questionMap = new Map(questions.map((q: any) => [q._id.toString(), q]));

  const transcript = responseDoc.answers.map((ans: any) => {
    const q = questionMap.get(ans.questionId);

    if (!q) return null;

    return {
      questionId: q._id,
      question: q.question,
      options: q.options,
      selectedAnswer: ans.selectedOption,
      correctAnswer: q.correctAnswer,
      isCorrect: ans.selectedOption === q.correctAnswer,
    };
  });

  return {
    examination,
    student,
    category: questionCategory,
    score: responseDoc.score,
    totalQuestions: questions.length,
    transcript: transcript.filter(Boolean),
  };
};

export const getExamTranscript = async (
  req: AuthenticatedStudent,
  res: Response,
) => {
  try {
    if (!req.student) {
      return res.sendStatus(401);
    }
    // const data = await generateExamTranscript({
    //   examination: req.query.examination as string,
    //   student: req.student?._id.toString() as string,
    //   // questionCategory: req.student?.classCategory as string,
    // });

    // res.json(data);
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
