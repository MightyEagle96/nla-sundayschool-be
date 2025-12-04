"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionBankRouter = void 0;
const express_1 = require("express");
const questionBankController_1 = require("../controllers/questionBankController");
const jwtController_1 = require("../controllers/jwtController");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: "./uploads" });
const questionBankRouter = (0, express_1.Router)();
exports.questionBankRouter = questionBankRouter;
questionBankRouter
    //  .get("/count", viewQuestionBankCount)
    .post("/create", jwtController_1.authenticateToken, questionBankController_1.createQuestion)
    .get("/view", jwtController_1.authenticateToken, questionBankController_1.viewQuestionBank)
    .post("/upload", jwtController_1.authenticateToken, upload.single("file"), questionBankController_1.uploadQuestionBankFile)
    .get("/delete", jwtController_1.authenticateToken, questionBankController_1.deleteQuestion)
    .get("/deletequestionbank", jwtController_1.authenticateToken, questionBankController_1.deleteQuestionBank)
    .use("*", (req, res) => {
    res.status(404).send("Not found");
});
