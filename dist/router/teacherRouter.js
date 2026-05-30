"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacherAccountController_1 = require("../controllers/teacherAccountController");
const jwtController_1 = require("../controllers/jwtController");
const teacherRouter = (0, express_1.Router)();
teacherRouter
    .use(jwtController_1.authenticateToken)
    .get("/students", teacherAccountController_1.getMyStudents)
    .get("/performance", teacherAccountController_1.myStudentsPerformance);
exports.default = teacherRouter;
