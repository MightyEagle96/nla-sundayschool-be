import { Router } from "express";
import {
  createAccount,
  loginAccount,
  logout,
  myProfile,
} from "../controllers/accountController";
import { authenticateToken } from "../controllers/jwtController";

const accountRouter = Router();

accountRouter
  .post("/register", createAccount)
  .post("/login", loginAccount)
  .get("/myprofile", authenticateToken, myProfile)
  .get("/logout", authenticateToken, logout);

export { accountRouter };
