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
exports.toggleActivation = exports.viewActiveExamination = exports.deleteExamination = exports.viewExaminations = exports.createExamination = void 0;
const examinationModel_1 = __importDefault(require("../models/examinationModel"));
const questionBankModel_1 = __importDefault(require("../models/questionBankModel"));
const createExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const existing = yield examinationModel_1.default.findOne({ title: req.body.title });
        if (existing) {
            return res.status(400).send("Examination already exists");
        }
        req.body.createdBy = (_a = req.teacher) === null || _a === void 0 ? void 0 : _a._id;
        if (req.body.examinationId) {
            yield examinationModel_1.default.updateOne({ _id: req.body.examinationId }, { title: req.body.title });
            res.send("Examination updated successfully");
        }
        else {
            yield examinationModel_1.default.create(req.body);
            res.send("Examination created successfully");
        }
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
exports.createExamination = createExamination;
// export const viewExaminations = async (req: Request, res: Response) => {
//   const examinations = await examinationModel.find();
//   const mappedExaminations = examinations.map((examination, i) => {
//     return {
//       _id: examination._id,
//       title: examination.title,
//       id: i + 1,
//     };
//   });
//   res.send(mappedExaminations);
// };
const viewExaminations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all examinations first
        const examinations = yield examinationModel_1.default.find();
        // Get all question banks grouped by examination
        const stats = yield questionBankModel_1.default.aggregate([
            {
                $group: {
                    _id: "$examination",
                    totalQuestions: { $sum: { $size: "$questions" } },
                    adultQuestions: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: "$questions",
                                    as: "q",
                                    cond: { $eq: ["$$q.classCategory", "adult"] },
                                },
                            },
                        },
                    },
                    yayaQuestions: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: "$questions",
                                    as: "q",
                                    cond: { $eq: ["$$q.classCategory", "yaya"] },
                                },
                            },
                        },
                    },
                },
            },
        ]);
        // Convert aggregation result to a lookup map
        const statsMap = new Map(stats.map((s) => {
            var _a;
            return [
                (_a = s._id) === null || _a === void 0 ? void 0 : _a.toString(),
                {
                    totalQuestions: s.totalQuestions,
                    adultQuestions: s.adultQuestions,
                    yayaQuestions: s.yayaQuestions,
                },
            ];
        }));
        // Combine examination data with stats
        const mapped = examinations.map((exam, index) => {
            const stat = statsMap.get(exam._id.toString()) || {
                totalQuestions: 0,
                adultQuestions: 0,
                yayaQuestions: 0,
            };
            return Object.assign({ _id: exam._id, title: exam.title, id: index + 1, duration: exam.duration }, stat);
        });
        res.send(mapped);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});
exports.viewExaminations = viewExaminations;
const deleteExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield examinationModel_1.default.deleteOne({ _id: req.query.id });
    res.send("Examination deleted");
});
exports.deleteExamination = deleteExamination;
const viewActiveExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const examination = yield examinationModel_1.default.findOne({ active: true });
    res.send(examination);
});
exports.viewActiveExamination = viewActiveExamination;
const toggleActivation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examination = yield examinationModel_1.default.findOne({ _id: req.query.id });
        if (!examination) {
            return res.status(400).send("Examination not found");
        }
        yield examinationModel_1.default.updateMany({}, { active: false });
        examination.active = !examination.active;
        yield examination.save();
        res.send("Examination updated successfully");
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
exports.toggleActivation = toggleActivation;
