import { Router } from "express";
import { authenticateToken } from "../controllers/jwtController";
import {
  createExamination,
  deleteExamination,
  fetchQuestions,
  getExamTranscript,
  saveResponses,
  toggleActivation,
  updateDuration,
  viewActiveExamination,
  viewExamination,
  viewExaminations,
  viewResults,
} from "../controllers/examinationController";
import { restrictToAdmin } from "../controllers/accountController";
import { viewExamResults } from "../controllers/adminDashboard";

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
  .get("/viewactiveexamination", authenticateToken, viewActiveExamination)
  .get("/viewexamination", authenticateToken, viewExamination)
  .get("/results", authenticateToken, viewResults)
  .patch("/updateduration", authenticateToken, restrictToAdmin, updateDuration)
  .get(
    "/toggleactivation",
    authenticateToken,
    restrictToAdmin,
    toggleActivation,
  )

  .get("/fetchquestions", authenticateToken, fetchQuestions)
  .post("/saveresponses", authenticateToken, saveResponses)
  .get("/examtranscript", authenticateToken, getExamTranscript)

  .get("/examinationresults", authenticateToken, viewExamResults);

export { examinationRouter };
