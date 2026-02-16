import { Request, Response } from "express";
import excelToJson from "convert-excel-to-json";
import questionBankModel from "../models/questionBankModel";
import { AuthenticatedTeacher } from "../models/teacherModel";
import path from "path";

import { promises as fs } from "fs";
import mongoose, { Types } from "mongoose";

export const createQuestion = async (
  req: AuthenticatedTeacher,
  res: Response,
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

export const uploadQuestionBankFile = async (req: Request, res: Response) => {
  console.log("📤 Uploading question file...");
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    const uploadPath = req.file?.path; // <-- this exists
    const finalPath = path.join("./uploads", req.file?.originalname); // new name

    console.log("📤 finished uploading question file.");

    await fs.rename(uploadPath, finalPath);

    const result = excelToJson({
      sourceFile: finalPath,
      header: {
        rows: 1,
      },
      columnToKey: {
        A: "question",
        B: "option1",
        C: "option2",
        D: "option3",
        E: "option4",
        F: "answer",
      },
    });

    const allRows = Object.values(result).flat();
    console.log(`📄 Found ${allRows.length} total rows in Excel file.`);

    const finalData = allRows.map((row) => {
      const options = [row.option1, row.option2, row.option3, row.option4];

      const correctAnswer = resolveCorrectAnswer(row.answer, options);
      return {
        question: row.question,
        options: [row.option1, row.option2, row.option3, row.option4],
        correctAnswer,
        classCategory: req.query.classCategory,
      };
    });

    await questionBankModel.updateOne(
      { examination: req.query.examination },
      { $push: { questions: { $each: finalData } } },
      { upsert: true },
    );

    //console.log(allRows);

    res.send("File uploaded successfully");

    await fs.unlink(finalPath);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

function resolveCorrectAnswer(raw: string, options: string[]): string {
  const lower = raw.toLowerCase().trim();

  // Letter or number
  const letterMatch = lower.match(/^[abcd1-4]$/);
  if (letterMatch) {
    const idx = "abcd1234".indexOf(lower[0]);
    if (idx >= 0 && idx < 4) return options[idx];
  }

  // "a)" or "A." style
  const prefixMatch = lower.match(/^[abcd][\)\.\]]/);
  if (prefixMatch) {
    const idx = "abcd".indexOf(prefixMatch[0][0]);
    if (idx >= 0 && idx < 4) return options[idx];
  }

  // Direct text match
  const exact = options.find((opt) => opt.toLowerCase() === lower);
  if (exact) return exact;

  const partial = options.find(
    (opt) =>
      opt.toLowerCase().includes(lower) || lower.includes(opt.toLowerCase()),
  );
  if (partial) return partial;

  console.warn(
    `Could not resolve answer "${raw}". Defaulting to first option.`,
  );
  return options[0];
}

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    // await questionBankModel.deleteOne({ examination: req.query.examination });
    //

    await questionBankModel.updateOne(
      { examination: req.query.examination },
      {
        $pull: {
          questions: { _id: new Types.ObjectId(req.query.question as string) },
        },
      },
    );
    res.send("Question bank deleted successfully");
  } catch (error) {
    res.sendStatus(500);
  }
};

export const deleteQuestionBank = async (req: Request, res: Response) => {
  try {
    await questionBankModel.deleteOne({ examination: req.query.examination });
    res.send("Question bank deleted successfully");
  } catch (error) {
    res.sendStatus(500);
  }
};

export const updateQuestion = async (
  req: AuthenticatedTeacher,
  res: Response,
) => {
  try {
    const { questionId, examination } = req.query;
    const { question, options, correctAnswer } = req.body;

    await questionBankModel.updateOne(
      { "questions._id": questionId, examination },
      {
        $set: {
          "questions.$.question": question,
          "questions.$.options": options,
          "questions.$.correctAnswer": correctAnswer,
        },
      },
    );

    res.send("Question updated successfully");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const createQuestionBank = async (req: Request, res: Response) => {
  try {
    //existing question bank
    const existing = await questionBankModel.findOne({
      examination: req.body.examination,
      classCategory: req.body.classCategory,
    });

    if (existing) {
      return res.status(400).send("Question bank already exists");
    }

    await questionBankModel.create(req.body);
    res.send("Question bank created successfully");
  } catch (error) {
    res.sendStatus(500);
  }
};

export const getBanksByExamination = async (req: Request, res: Response) => {
  try {
    const examId = req.query.examination;

    if (!examId) {
      return res.status(400).json({ message: "Examination id required" });
    }

    const data = await questionBankModel.aggregate([
      {
        $match: {
          examination: new mongoose.Types.ObjectId(examId as string),
        },
      },

      // Populate classCategory
      {
        $lookup: {
          from: "classcategories", // confirm actual collection name
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

      // Compute question size
      {
        $addFields: {
          questionCount: { $size: "$questions" },
        },
      },

      // Remove heavy payload
      {
        $project: {
          questions: 0,
        },
      },
    ]);

    const mapped = data.map((bank, i) => {
      return {
        ...bank,
        id: i + 1,
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch question banks" });
  }
};

export const getQuestionBank = async (req: Request, res: Response) => {
  const data = await questionBankModel
    .findOne(req.query)
    .populate("classCategory");
  res.send(data);
};
