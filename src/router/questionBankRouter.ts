import { Router } from "express";
import {
  createQuestion,
  createQuestionBank,
  deleteQuestion,
  deleteQuestionBank,
  getBanksByExamination,
  updateQuestion,
  uploadQuestionBankFile,
} from "../controllers/questionBankController";
import { authenticateToken } from "../controllers/jwtController";
import multer from "multer";

const upload = multer({ dest: "./uploads" });

const questionBankRouter = Router();

questionBankRouter
  //  .get("/count", viewQuestionBankCount)
  .post("/createquestionbank", authenticateToken, createQuestionBank)
  .post("/create", authenticateToken, createQuestion)
  .get("/view", authenticateToken, getBanksByExamination)
  .post(
    "/upload",
    authenticateToken,
    upload.single("file"),
    uploadQuestionBankFile,
  )
  .get("/delete", authenticateToken, deleteQuestion)
  .get("/deletequestionbank", authenticateToken, deleteQuestionBank)
  .put("/update", authenticateToken, updateQuestion)

  .use("*", (req, res) => {
    res.status(404).send("Not found");
  });

export { questionBankRouter };
