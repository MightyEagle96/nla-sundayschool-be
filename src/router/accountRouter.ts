import { Router } from "express";
import {
  createAccount,
  loginAccount,
  logout,
  myProfile,
} from "../controllers/accountController";
import { authenticateToken } from "../controllers/jwtController";
import {
  teacherCreateAccount,
  teacherLoginAccount,
} from "../controllers/teacherAccountController";

const accountRouter = Router();

accountRouter
  .post("/register", createAccount)
  .post("/login", loginAccount)
  .get("/myprofile", authenticateToken, myProfile)
  .get("/logout", authenticateToken, logout)

  // teacher account
  .post("/teacher/register", teacherCreateAccount)
  .post("/teacher/login", teacherLoginAccount);

export { accountRouter };
