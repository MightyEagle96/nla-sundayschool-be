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
exports.tokens = void 0;
exports.generateToken = generateToken;
exports.generateRefreshToken = generateRefreshToken;
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const studentModel_1 = require("../models/studentModel");
const teacherModel_1 = require("../models/teacherModel");
dotenv_1.default.config();
exports.tokens = {
    auth_token: "auth_token",
    refresh_token: "refresh_token",
};
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
    });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN, {
        expiresIn: "2d",
    });
}
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get token from cookie
            const token = req.cookies[exports.tokens.auth_token];
            console.log("token", token);
            if (!token) {
                return res.status(401).json({ message: "Not authenticated" });
            }
            // Verify JWT
            const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN);
            if (decoded.role === "teacher") {
                const teacher = yield teacherModel_1.TeacherModel.findById(decoded._id).lean();
                if (!teacher) {
                    return res.status(401).json({ message: "Not authenticated" });
                }
                req.teacher = teacher;
                next();
                return;
            }
            if (decoded.role === "student") {
                const student = yield studentModel_1.StudentModel.findById(decoded._id).lean();
                if (!student) {
                    return res.status(401).json({ message: "Not authenticated" });
                }
                req.student = student;
                next();
                return;
            }
            if (!(decoded === null || decoded === void 0 ? void 0 : decoded._id)) {
                return res.status(403).json({ message: "Invalid token payload" });
            }
        }
        catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token expired" });
            }
            return res.status(403).json({ message: "Invalid token" });
        }
    });
}
