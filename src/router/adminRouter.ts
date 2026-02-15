import { Router } from "express";
import {
  addClassCategory,
  adminDashboard,
  createClass,
  viewClassCategories,
} from "../controllers/adminDashboard";

const adminRouter = Router();

adminRouter
  .get("/dashboard", adminDashboard)
  .post("/createclass", createClass)
  .get("/classcategories", viewClassCategories)
  .post("/addclasscategory", addClassCategory);

export default adminRouter;
