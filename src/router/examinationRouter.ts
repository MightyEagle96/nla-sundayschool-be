import { Router } from "express";
import { authenticateToken } from "../controllers/jwtController";
import {
  createExamination,
  deleteExamination,
  fetchQuestions,
  saveResponses,
  toggleActivation,
  updateDuration,
  viewActiveExamination,
  viewExamination,
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
  .get("/viewexamination", viewExamination)
  .patch("/updateduration", authenticateToken, restrictToAdmin, updateDuration)
  .get(
    "/toggleactivation",
    authenticateToken,
    restrictToAdmin,
    toggleActivation,
  )

  .get("/fetchquestions", authenticateToken, fetchQuestions)
  .post("/saveresponses", authenticateToken, saveResponses);

export { examinationRouter };
