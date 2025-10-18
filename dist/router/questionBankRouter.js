"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionBankRouter = void 0;
const express_1 = require("express");
const questionBankController_1 = require("../controllers/questionBankController");
const questionBankRouter = (0, express_1.Router)();
exports.questionBankRouter = questionBankRouter;
questionBankRouter
    .get("/count", questionBankController_1.viewQuestionBankCount)
    .use("*", (req, res) => {
    res.status(404).send("Not found");
});
