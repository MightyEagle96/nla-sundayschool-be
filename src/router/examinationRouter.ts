import { Router } from "express";
import { authenticateToken } from "../controllers/jwtController";
import {
  createExamination,
  viewExaminations,
} from "../controllers/examinationController";
import { restrictToAdmin } from "../controllers/accountController";

const examinationRouter = Router();

examinationRouter
  .post("/create", authenticateToken, restrictToAdmin, createExamination)
  .get("/view", viewExaminations);

export { examinationRouter };
