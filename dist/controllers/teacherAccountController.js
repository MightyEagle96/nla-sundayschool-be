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
exports.teacherLoginAccount = exports.teacherCreateAccount = void 0;
const DataQueue_1 = require("../utils/DataQueue");
const teacherModel_1 = require("../models/teacherModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtController_1 = require("./jwtController");
const accountQueue = new DataQueue_1.ConcurrentJobQueue(4, 10);
const teacherCreateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield teacherModel_1.TeacherModel.findOne({
            $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
        });
        if (account) {
            return res.status(400).send("Account already exists");
        }
        accountQueue.enqueue(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield teacherModel_1.TeacherModel.create(req.body);
            }
            catch (error) {
                console.log(error);
            }
        }));
        res.send("Account created successfully");
    }
    catch (error) {
        console.error("Queue job failed:", error);
        res.status(500).send("Error creating account");
    }
});
exports.teacherCreateAccount = teacherCreateAccount;
const teacherLoginAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const existing = yield teacherModel_1.TeacherModel.findOne({
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
                role: "teacher",
            });
            const refreshToken = (0, jwtController_1.generateRefreshToken)({
                _id: existing._id,
                email: existing.email,
                role: "teacher",
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
exports.teacherLoginAccount = teacherLoginAccount;
