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
exports.viewExaminations = exports.createExamination = void 0;
const examinationModel_1 = __importDefault(require("../models/examinationModel"));
const createExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (((_a = req.teacher) === null || _a === void 0 ? void 0 : _a.adminRights) === false) {
            return res.status(401).send("Not authorized");
        }
        const existing = yield examinationModel_1.default.findOne({ title: req.body.title });
        if (existing) {
            return res.status(400).send("Examination already exists");
        }
        req.body.createdBy = (_b = req.teacher) === null || _b === void 0 ? void 0 : _b._id;
        if (req.body.examinationId) {
            yield examinationModel_1.default.updateOne({ _id: req.body.examinationId }, { title: req.body.title });
        }
        else
            yield examinationModel_1.default.create(req.body);
        res.send("Examination created successfully");
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
exports.createExamination = createExamination;
const viewExaminations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const examinations = yield examinationModel_1.default.find();
    const mappedExaminations = examinations.map((examination, i) => {
        return {
            _id: examination._id,
            title: examination.title,
            id: i + 1,
        };
    });
    res.send(mappedExaminations);
});
exports.viewExaminations = viewExaminations;
