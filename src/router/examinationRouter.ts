import { Router } from "express";
import { authenticateToken } from "../controllers/jwtController";
import {
  createExamination,
  deleteExamination,
  toggleActivation,
  updateDuration,
  viewActiveExamination,
  viewExaminations,
} from "../controllers/examinationController";
import { restrictToAdmin } from "../controllers/accountController";

const examinationRouter = Router();

examinationRouter
  .post("/create", authenticateToken, restrictToAdmin, createExamination)
  .get("/view", viewExaminations)
  .get("/delete", authenticateToken, restrictToAdmin, deleteExamination)
  .get(
    "/toggleexamination",
    authenticateToken,
    restrictToAdmin,
    toggleActivation,
  )
  .get("/viewactiveexamination", viewActiveExamination)
  .patch("/updateduration", updateDuration);

export { examinationRouter };
