import { Router } from "express";
import {
  addClassCategory,
  adminDashboard,
  createClass,
  viewClassCategories,
  viewClasses,
} from "../controllers/adminDashboard";

const adminRouter = Router();

adminRouter
  .get("/dashboard", adminDashboard)
  .post("/createclass", createClass)
  .get("/classcategories", viewClassCategories)
  .post("/addclasscategory", addClassCategory)
  .get("/classes", viewClasses);

export default adminRouter;
