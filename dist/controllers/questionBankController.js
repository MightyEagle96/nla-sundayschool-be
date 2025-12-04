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
exports.viewQuestionBank = exports.createQuestion = exports.classCategory = void 0;
const questionBankModel_1 = __importDefault(require("../models/questionBankModel"));
exports.classCategory = {
    yaya: "yaya",
    adult: "adult",
};
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
const viewQuestionBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionBank = yield questionBankModel_1.default
            .findOne({
            examination: req.query.examination,
        })
            .lean();
        if (questionBank) {
            const mapped = questionBank.questions.map((question, id) => {
                return Object.assign(Object.assign({}, question), { id: id + 1 });
            });
            return res.send(mapped);
        }
        res.send([]);
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.viewQuestionBank = viewQuestionBank;
