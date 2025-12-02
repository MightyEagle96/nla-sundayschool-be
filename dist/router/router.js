"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountRouter_1 = require("./accountRouter");
const questionBankRouter_1 = require("./questionBankRouter");
const examinationRouter_1 = require("./examinationRouter");
const appRouter = (0, express_1.Router)();
appRouter
    .use("/auth", accountRouter_1.accountRouter)
    .use("/questionbank", questionBankRouter_1.questionBankRouter)
    .use("/examination", examinationRouter_1.examinationRouter)
    .use("*", (req, res) => {
    res.status(404).send("Not found");
});
exports.default = appRouter;
