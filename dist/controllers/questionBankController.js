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
exports.viewQuestionBankCount = exports.classCategory = exports.createQuestionBank = void 0;
const questionBankModel_1 = __importDefault(require("../models/questionBankModel"));
const createQuestionBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        req.body.createdBy = (_a = req.teacher) === null || _a === void 0 ? void 0 : _a._id;
        const questionBank = yield questionBankModel_1.default.create(req.body);
        res.status(201).json(questionBank);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create question bank" });
    }
});
exports.createQuestionBank = createQuestionBank;
exports.classCategory = {
    yaya: "yaya",
    adult: "adult",
};
const viewQuestionBankCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [adultCount, yayaCount] = yield Promise.all([
        questionBankModel_1.default.countDocuments({ classCategory: exports.classCategory.adult }),
        questionBankModel_1.default.countDocuments({ classCategory: exports.classCategory.yaya }),
    ]);
    res.json({ yayaCount, adultCount });
});
exports.viewQuestionBankCount = viewQuestionBankCount;
