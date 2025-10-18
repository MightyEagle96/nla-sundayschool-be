import { Router } from "express";
import { viewQuestionBankCount } from "../controllers/questionBankController";

const questionBankRouter = Router();

questionBankRouter
  .get("/count", viewQuestionBankCount)

  .use("*", (req, res) => {
    res.status(404).send("Not found");
  });

export { questionBankRouter };
