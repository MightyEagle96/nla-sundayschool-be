import { Router } from "express";
import { accountRouter } from "./accountRouter";

const appRouter = Router();

appRouter.use("/auth", accountRouter).use("*", (req, res) => {
  res.status(404).send("Not found");
});

export default appRouter;
