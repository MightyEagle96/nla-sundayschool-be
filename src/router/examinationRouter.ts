import { Router } from "express";
import { authenticateToken } from "../controllers/jwtController";
import {
  createExamination,
  viewExaminations,
} from "../controllers/examinationController";

const examinationRouter = Router();

examinationRouter
  .post("/create", authenticateToken, createExamination)
  .get("/view", viewExaminations);

export { examinationRouter };
