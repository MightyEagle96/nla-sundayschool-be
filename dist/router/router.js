"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountRouter_1 = require("./accountRouter");
const appRouter = (0, express_1.Router)();
appRouter.use("/auth", accountRouter_1.accountRouter).use("*", (req, res) => {
    res.status(404).send("Not found");
});
exports.default = appRouter;
