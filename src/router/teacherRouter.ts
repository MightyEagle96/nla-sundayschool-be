import { Router } from "express";
import {
  getMyStudents,
  myStudentsPerformance,
} from "../controllers/teacherAccountController";
import { authenticateToken } from "../controllers/jwtController";

const teacherRouter = Router();

teacherRouter
  .use(authenticateToken)
  .get("/students", getMyStudents)
  .get("/performance", myStudentsPerformance);

export default teacherRouter;
