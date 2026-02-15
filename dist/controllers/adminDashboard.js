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
exports.createClass = exports.adminDashboard = exports.yayaClasses = exports.adultClasses = void 0;
const studentModel_1 = require("../models/studentModel");
const teacherModel_1 = require("../models/teacherModel");
const classModel_1 = __importDefault(require("../models/classModel"));
exports.adultClasses = [
    "grace",
    "mercy",
    "favor",
    "peace",
    "love",
    "goodness",
].sort();
exports.yayaClasses = ["glory", "truth", "wisdom"].sort();
const adminDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [students, teachers] = yield Promise.all([
            studentModel_1.StudentModel.countDocuments(),
            teacherModel_1.TeacherModel.countDocuments(),
        ]);
        res.send({
            students,
            teachers,
            adultClasses: exports.adultClasses.length,
            yayaClasses: exports.yayaClasses.length,
        });
    }
    catch (error) { }
});
exports.adminDashboard = adminDashboard;
const createClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const existingClass = yield classModel_1.default.findOne({
            name: body.name,
            classCategory: body.classCategory,
        });
        if (existingClass) {
            throw new Error("Class already exists");
        }
        yield classModel_1.default.create(body);
        res.send("Class created");
    }
    catch (error) {
        console.log(new Error(error));
        res.status(500).send(new Error(error).message);
    }
});
exports.createClass = createClass;
