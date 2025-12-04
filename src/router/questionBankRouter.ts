import { Router } from "express";
import {
  createQuestion,
  viewQuestionBank,
} from "../controllers/questionBankController";
import { authenticateToken } from "../controllers/jwtController";

const questionBankRouter = Router();

questionBankRouter
  //  .get("/count", viewQuestionBankCount)
  .post("/create", authenticateToken, createQuestion)
  .get("/view", authenticateToken, viewQuestionBank)

  .use("*", (req, res) => {
    res.status(404).send("Not found");
  });

export { questionBankRouter };
