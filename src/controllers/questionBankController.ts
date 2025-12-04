import { Request, Response } from "express";
import excelToJson from "convert-excel-to-json";
import questionBankModel from "../models/questionBankModel";
import { AuthenticatedTeacher } from "../models/teacherModel";
import path from "path";

import { promises as fs } from "fs";
import { Types } from "mongoose";

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
      { upsert: true }
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
      opt.toLowerCase().includes(lower) || lower.includes(opt.toLowerCase())
  );
  if (partial) return partial;

  console.warn(
    `Could not resolve answer "${raw}". Defaulting to first option.`
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
      }
    );
    res.send("Question bank deleted successfully");
  } catch (error) {
    res.sendStatus(500);
  }
};
