import { Router } from "express";
import { accountRouter } from "./accountRouter";
import { questionBankRouter } from "./questionBankRouter";
import { examinationRouter } from "./examinationRouter";

const appRouter = Router();

appRouter
  .use("/auth", accountRouter)

  .use("/questionbank", questionBankRouter)

  .use("/examination", examinationRouter)

  .use("*", (req, res) => {
    res.status(404).send("Not found");
  });

export default appRouter;
