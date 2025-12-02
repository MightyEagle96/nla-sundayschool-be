import { Router } from "express";
import { authenticateToken } from "../controllers/jwtController";
import { createExamination } from "../controllers/examinationController";

const examinationRouter = Router();

examinationRouter.post("/create", authenticateToken, createExamination);

export { examinationRouter };
