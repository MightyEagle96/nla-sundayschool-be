"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionBankRouter = void 0;
const express_1 = require("express");
const questionBankController_1 = require("../controllers/questionBankController");
const jwtController_1 = require("../controllers/jwtController");
const questionBankRouter = (0, express_1.Router)();
exports.questionBankRouter = questionBankRouter;
questionBankRouter
    //  .get("/count", viewQuestionBankCount)
    .post("/create", jwtController_1.authenticateToken, questionBankController_1.createQuestion)
    .get("/view", jwtController_1.authenticateToken, questionBankController_1.viewQuestionBank)
    .use("*", (req, res) => {
    res.status(404).send("Not found");
});
