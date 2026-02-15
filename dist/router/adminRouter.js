"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminDashboard_1 = require("../controllers/adminDashboard");
const adminRouter = (0, express_1.Router)();
adminRouter
    .get("/dashboard", adminDashboard_1.adminDashboard)
    .post("/createclass", adminDashboard_1.createClass)
    .get("/classcategories", adminDashboard_1.viewClassCategories)
    .post("/addclasscategory", adminDashboard_1.addClassCategory);
exports.default = adminRouter;
