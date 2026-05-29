import { Router } from "express";
import {
  addClassCategory,
  adminDashboard,
  createClass,
  viewClassCategories,
  viewClasses,
  viewClassesForm,
} from "../controllers/adminDashboard";

const adminRouter = Router();

adminRouter
  .get("/dashboard", adminDashboard)
  .post("/createclass", createClass)
  .get("/classcategories", viewClassCategories)
  .post("/addclasscategory", addClassCategory)
  .get("/classes", viewClasses)
  .get("/classform", viewClassesForm);

export default adminRouter;
