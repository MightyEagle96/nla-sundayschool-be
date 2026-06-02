import { Router } from "express";
import {
  addClassCategory,
  adminDashboard,
  createClass,
  viewClass,
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
  .get("/classform", viewClassesForm)
  .get("/viewclass", viewClass);

export default adminRouter;
