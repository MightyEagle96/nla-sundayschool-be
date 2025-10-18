import { Router } from "express";
import { accountRouter } from "./accountRouter";
import { questionBankRouter } from "./questionBankRouter";

const appRouter = Router();

appRouter
  .use("/auth", accountRouter)

  .use("/questionbank", questionBankRouter)

  .use("*", (req, res) => {
    res.status(404).send("Not found");
  });

export default appRouter;
