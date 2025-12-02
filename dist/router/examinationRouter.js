"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examinationRouter = void 0;
const express_1 = require("express");
const jwtController_1 = require("../controllers/jwtController");
const examinationController_1 = require("../controllers/examinationController");
const examinationRouter = (0, express_1.Router)();
exports.examinationRouter = examinationRouter;
examinationRouter.post("/create", jwtController_1.authenticateToken, examinationController_1.createExamination);
