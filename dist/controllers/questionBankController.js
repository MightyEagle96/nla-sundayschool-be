"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getQuestionBank = exports.getBanksByExamination = exports.createQuestionBank = exports.updateQuestion = exports.deleteQuestionBank = exports.deleteQuestion = exports.uploadQuestionBankFile = exports.createQuestion = void 0;
const convert_excel_to_json_1 = __importDefault(require("convert-excel-to-json"));
const questionBankModel_1 = __importDefault(require("../models/questionBankModel"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const mongoose_1 = __importStar(require("mongoose"));
const createQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionBank = yield questionBankModel_1.default.findOne({
            examination: req.body.examination,
        });
        if (questionBank) {
            questionBank.questions.push(req.body);
            yield questionBank.save();
        }
        else {
            const newQuestionBank = yield questionBankModel_1.default.create({
                examination: req.body.examination,
                questions: [req.body],
            });
        }
        res.send("Question created successfully");
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.createQuestion = createQuestion;
const uploadQuestionBankFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("📤 Uploading question file...");
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }
        const uploadPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path; // <-- this exists
        const finalPath = path_1.default.join("./uploads", (_b = req.file) === null || _b === void 0 ? void 0 : _b.originalname); // new name
        console.log("📤 finished uploading question file.");
        yield fs_1.promises.rename(uploadPath, finalPath);
        const result = (0, convert_excel_to_json_1.default)({
            sourceFile: finalPath,
            header: {
                rows: 1,
            },
            columnToKey: {
                A: "question",
                B: "option1",
                C: "option2",
                D: "option3",
                E: "option4",
                F: "answer",
            },
        });
        const allRows = Object.values(result).flat();
        console.log(`📄 Found ${allRows.length} total rows in Excel file.`);
        const finalData = allRows.map((row) => {
            const options = [row.option1, row.option2, row.option3, row.option4];
            const correctAnswer = resolveCorrectAnswer(row.answer, options);
            return {
                question: row.question,
                options: [row.option1, row.option2, row.option3, row.option4],
                correctAnswer,
                classCategory: req.query.classCategory,
            };
        });
        yield questionBankModel_1.default.updateOne({ _id: req.query._id }, {
            questions: finalData,
        });
        res.send("File uploaded successfully");
        yield fs_1.promises.unlink(finalPath);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
exports.uploadQuestionBankFile = uploadQuestionBankFile;
function resolveCorrectAnswer(raw, options) {
    const lower = raw.toLowerCase().trim();
    // Letter or number
    const letterMatch = lower.match(/^[abcd1-4]$/);
    if (letterMatch) {
        const idx = "abcd1234".indexOf(lower[0]);
        if (idx >= 0 && idx < 4)
            return options[idx];
    }
    // "a)" or "A." style
    const prefixMatch = lower.match(/^[abcd][\)\.\]]/);
    if (prefixMatch) {
        const idx = "abcd".indexOf(prefixMatch[0][0]);
        if (idx >= 0 && idx < 4)
            return options[idx];
    }
    // Direct text match
    const exact = options.find((opt) => opt.toLowerCase() === lower);
    if (exact)
        return exact;
    const partial = options.find((opt) => opt.toLowerCase().includes(lower) || lower.includes(opt.toLowerCase()));
    if (partial)
        return partial;
    console.warn(`Could not resolve answer "${raw}". Defaulting to first option.`);
    return options[0];
}
const deleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await questionBankModel.deleteOne({ examination: req.query.examination });
        //
        yield questionBankModel_1.default.updateOne({ examination: req.query.examination }, {
            $pull: {
                questions: { _id: new mongoose_1.Types.ObjectId(req.query.question) },
            },
        });
        res.send("Question bank deleted successfully");
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.deleteQuestion = deleteQuestion;
const deleteQuestionBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield questionBankModel_1.default.deleteOne({ examination: req.query.examination });
        res.send("Question bank deleted successfully");
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.deleteQuestionBank = deleteQuestionBank;
const updateQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questionId, examination } = req.query;
        const { question, options, correctAnswer } = req.body;
        yield questionBankModel_1.default.updateOne({ "questions._id": questionId, examination }, {
            $set: {
                "questions.$.question": question,
                "questions.$.options": options,
                "questions.$.correctAnswer": correctAnswer,
            },
        });
        res.send("Question updated successfully");
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
exports.updateQuestion = updateQuestion;
const createQuestionBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //existing question bank
        const existing = yield questionBankModel_1.default.findOne({
            examination: req.body.examination,
            classCategory: req.body.classCategory,
        });
        if (existing) {
            return res.status(400).send("Question bank already exists");
        }
        yield questionBankModel_1.default.create(req.body);
        res.send("Question bank created successfully");
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.createQuestionBank = createQuestionBank;
const getBanksByExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examId = req.query.examination;
        if (!examId) {
            return res.status(400).json({ message: "Examination id required" });
        }
        const data = yield questionBankModel_1.default.aggregate([
            {
                $match: {
                    examination: new mongoose_1.default.Types.ObjectId(examId),
                },
            },
            // Populate classCategory
            {
                $lookup: {
                    from: "classcategories", // confirm actual collection name
                    localField: "classCategory",
                    foreignField: "_id",
                    as: "classCategory",
                },
            },
            {
                $unwind: {
                    path: "$classCategory",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Compute question size
            {
                $addFields: {
                    questionCount: { $size: "$questions" },
                },
            },
            // Remove heavy payload
            {
                $project: {
                    questions: 0,
                },
            },
        ]);
        const mapped = data.map((bank, i) => {
            return Object.assign(Object.assign({}, bank), { id: i + 1 });
        });
        res.json(mapped);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch question banks" });
    }
});
exports.getBanksByExamination = getBanksByExamination;
const getQuestionBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield questionBankModel_1.default
        .findOne(req.query)
        .populate("classCategory");
    res.send(data);
});
exports.getQuestionBank = getQuestionBank;
