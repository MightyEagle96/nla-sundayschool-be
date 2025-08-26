import { Router } from "express";
import { accountRouter } from "./accountRouter";

const appRouter = Router();

appRouter.use("/auth", accountRouter);

export default appRouter;
