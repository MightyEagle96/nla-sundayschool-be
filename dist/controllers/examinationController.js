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
    var _a;
    if (((_a = req.teacher) === null || _a === void 0 ? void 0 : _a.adminRights) === false) {
        return res.status(401).send("Not authorized");
    }
    yield examinationModel_1.default.create(req.body);
    res.send("Examination created successfully");
});
exports.createExamination = createExamination;
const viewExaminations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const examinations = yield examinationModel_1.default.find();
    res.send(examinations);
});
exports.viewExaminations = viewExaminations;
