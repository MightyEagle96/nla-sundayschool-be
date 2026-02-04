import { Router } from "express";
import {
  createAccount,
  getRefreshToken,
  loginAccount,
  logout,
  myProfile,
  viewCandidates,
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
  .post("/teacher/login", teacherLoginAccount)

  .get("/refresh", getRefreshToken)

  .get("/candidates", authenticateToken, viewCandidates)

  .get("*", (req, res) => {
    res.status(404).send("Not found");
  });

export { accountRouter };
