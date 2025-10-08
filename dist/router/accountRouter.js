"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRouter = void 0;
const express_1 = require("express");
const accountController_1 = require("../controllers/accountController");
const jwtController_1 = require("../controllers/jwtController");
const teacherAccountController_1 = require("../controllers/teacherAccountController");
const accountRouter = (0, express_1.Router)();
exports.accountRouter = accountRouter;
accountRouter
    .post("/register", accountController_1.createAccount)
    .post("/login", accountController_1.loginAccount)
    .get("/myprofile", jwtController_1.authenticateToken, accountController_1.myProfile)
    .get("/logout", jwtController_1.authenticateToken, accountController_1.logout)
    // teacher account
    .post("/teacher/register", teacherAccountController_1.teacherCreateAccount)
    .post("/teacher/login", teacherAccountController_1.teacherLoginAccount);
