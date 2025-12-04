import { Router } from "express";
import {
  createQuestion,
  uploadQuestionBankFile,
  viewQuestionBank,
} from "../controllers/questionBankController";
import { authenticateToken } from "../controllers/jwtController";
import multer from "multer";

const upload = multer({ dest: "./uploads" });

const questionBankRouter = Router();

questionBankRouter
  //  .get("/count", viewQuestionBankCount)
  .post("/create", authenticateToken, createQuestion)
  .get("/view", authenticateToken, viewQuestionBank)
  .post(
    "/upload",
    authenticateToken,
    upload.single("file"),
    uploadQuestionBankFile
  )

  .use("*", (req, res) => {
    res.status(404).send("Not found");
  });

export { questionBankRouter };
