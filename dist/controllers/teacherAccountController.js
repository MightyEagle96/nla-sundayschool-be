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
exports.myStudentsPerformance = exports.getMyStudents = exports.teacherLoginAccount = exports.createTeacherAccount = void 0;
const DataQueue_1 = require("../utils/DataQueue");
const teacherModel_1 = require("../models/teacherModel");
const jwtController_1 = require("./jwtController");
const classCategoryModel_1 = __importDefault(require("../models/classCategoryModel"));
const classModel_1 = __importDefault(require("../models/classModel"));
const studentModel_1 = require("../models/studentModel");
const candidateResponses_1 = __importDefault(require("../models/candidateResponses"));
const accountQueue = new DataQueue_1.ConcurrentJobQueue({
    concurrency: 4,
    maxQueueSize: 10,
    retries: 0,
    retryDelay: 0,
    shutdownTimeout: 30000,
});
const createTeacherAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAccount = yield teacherModel_1.TeacherModel.findOne({
        phoneNumber: req.body.phoneNumber,
    });
    if (existingAccount) {
        return res.status(400).send("Phone number already exists");
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
});
exports.createTeacherAccount = createTeacherAccount;
const teacherLoginAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const existing = yield teacherModel_1.TeacherModel.findOne({
        phoneNumber: body.phoneNumber,
    });
    if (!existing) {
        return res.status(400).send("Account not found");
    }
    const accessToken = (0, jwtController_1.generateToken)({
        _id: existing._id,
        role: "teacher",
    });
    const refreshToken = (0, jwtController_1.generateRefreshToken)({
        _id: existing._id,
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
});
exports.teacherLoginAccount = teacherLoginAccount;
const getMyStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const [classCategory, classData, students] = yield Promise.all([
            classCategoryModel_1.default.findById((_a = req.teacher) === null || _a === void 0 ? void 0 : _a.classCategory).lean(),
            classModel_1.default.findById((_b = req.teacher) === null || _b === void 0 ? void 0 : _b.classData).lean(),
            studentModel_1.StudentModel.find({ classData: (_c = req.teacher) === null || _c === void 0 ? void 0 : _c.classData }).lean(),
        ]);
        res.send({
            classCategory,
            classData,
            students,
        });
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.getMyStudents = getMyStudents;
const myStudentsPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const classDataId = (_a = req.teacher) === null || _a === void 0 ? void 0 : _a.classData;
        const responses = yield candidateResponses_1.default.find({
            examination: req.query.examination,
        })
            .select("student score")
            .populate({
            path: "student",
            match: { classData: classDataId }, // filter here
            select: "firstName lastName",
        })
            .lean();
        const filtered = responses
            .filter((r) => r.student) // removes null students (non-matching classData)
            .map((r) => ({
            studentName: `${r.student.firstName} ${r.student.lastName}`,
            score: r.score,
        }));
        res.send(filtered);
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.myStudentsPerformance = myStudentsPerformance;
