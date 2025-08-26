import { Router } from "express";
import { createAccount, loginAccount } from "../controllers/accountController";

const accountRouter = Router();

accountRouter.post("/register", createAccount).post("/login", loginAccount);

export { accountRouter };
