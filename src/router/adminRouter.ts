import { Router } from "express";
import { adminDashboard, createClass } from "../controllers/adminDashboard";

const adminRouter = Router();

adminRouter.get("/dashboard", adminDashboard).post("/createclass", createClass);

export default adminRouter;
