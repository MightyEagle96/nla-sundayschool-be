"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.myProfile = exports.loginAccount = exports.createAccount = void 0;
//Create Account
const bcrypt_1 = __importDefault(require("bcrypt"));
const studentModel_1 = require("../models/studentModel");
const DataQueue_1 = require("../utils/DataQueue");
const mailController_1 = require("../utils/mailController");
const emailTemplate_1 = require("./emailTemplate");
const jwtController_1 = require("./jwtController");
const queue = new DataQueue_1.ConcurrentJobQueue(4, 10);
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const existing = yield studentModel_1.StudentModel.findOne({
            $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
        });
        if (existing) {
            return res.status(400).send("Account already exists");
        }
        res.send("Account is being created");
        queue
            .enqueue(() => __awaiter(void 0, void 0, void 0, function* () {
            const student = new studentModel_1.StudentModel(body);
            yield student.save();
            const activationLink = `http://localhost:5173/activate/${student._id}`;
            yield (0, mailController_1.sendEmailFunc)(student.email, "Activate your account", (0, emailTemplate_1.notificationEmailTemplate)(`${student.firstName} ${student.lastName}`, activationLink));
        }))
            .then(() => {
            // res.status(200).send("Account created successfully");
        })
            .catch((err) => {
            console.error("Queue job failed:", err);
            // res.status(500).send("Error creating account");
        });
    }
    catch (error) {
        console.error("Request error:", error);
        res.status(500).send("Internal server error");
    }
});
exports.createAccount = createAccount;
//Verify Email
//Verify Account
//Login
const loginAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const existing = yield studentModel_1.StudentModel.findOne({
        $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
    });
    if (!existing) {
        return res.status(400).send("Account not found");
    }
    bcrypt_1.default.compare(body.password, existing.password).then((result) => {
        if (result) {
            const accessToken = (0, jwtController_1.generateToken)({
                _id: existing._id,
                email: existing.email,
            });
            const refreshToken = (0, jwtController_1.generateRefreshToken)({
                _id: existing._id,
                email: existing.email,
            });
            // res.send("Account logged in successfully");
            res
                .cookie(jwtController_1.tokens.auth_token, accessToken, {
                httpOnly: false,
                secure: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 1000 * 60 * 60, // 1h
            })
                .cookie(jwtController_1.tokens.refresh_token, refreshToken, {
                httpOnly: false,
                secure: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
            })
                .send("Logged In");
        }
        else {
            res.status(400).send("Invalid credentials");
        }
    });
});
exports.loginAccount = loginAccount;
//Change Password
//Delete Account
//Get Account Details
//Update Account Details
//Get All Accounts
//Delete Account
//Update Account
//Get Account
const myProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(req.student);
});
exports.myProfile = myProfile;
//Logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie(jwtController_1.tokens.auth_token, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.clearCookie(jwtController_1.tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.send("Logged Out");
});
exports.logout = logout;
