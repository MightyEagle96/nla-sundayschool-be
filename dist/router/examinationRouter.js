"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examinationRouter = void 0;
const express_1 = require("express");
const jwtController_1 = require("../controllers/jwtController");
const examinationController_1 = require("../controllers/examinationController");
const accountController_1 = require("../controllers/accountController");
const adminDashboard_1 = require("../controllers/adminDashboard");
const examinationRouter = (0, express_1.Router)();
exports.examinationRouter = examinationRouter;
examinationRouter
    .post("/create", jwtController_1.authenticateToken, accountController_1.restrictToAdmin, examinationController_1.createExamination)
    .get("/view", examinationController_1.viewExaminations)
    .get("/delete", jwtController_1.authenticateToken, accountController_1.restrictToAdmin, examinationController_1.deleteExamination)
    .get("/toggleexamination", jwtController_1.authenticateToken, accountController_1.restrictToAdmin, examinationController_1.toggleActivation)
    .get("/viewactiveexamination", jwtController_1.authenticateToken, examinationController_1.viewActiveExamination)
    .get("/viewexamination", jwtController_1.authenticateToken, examinationController_1.viewExamination)
    .get("/results", jwtController_1.authenticateToken, examinationController_1.viewResults)
    .patch("/updateduration", jwtController_1.authenticateToken, accountController_1.restrictToAdmin, examinationController_1.updateDuration)
    .get("/toggleactivation", jwtController_1.authenticateToken, accountController_1.restrictToAdmin, examinationController_1.toggleActivation)
    .get("/fetchquestions", jwtController_1.authenticateToken, examinationController_1.fetchQuestions)
    .post("/saveresponses", jwtController_1.authenticateToken, examinationController_1.saveResponses)
    .get("/examtranscript", jwtController_1.authenticateToken, examinationController_1.getExamTranscript)
    .get("/examinationresults", jwtController_1.authenticateToken, adminDashboard_1.viewExamResults);
