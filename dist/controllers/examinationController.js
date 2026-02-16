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
exports.getExamTranscript = exports.generateExamTranscript = exports.handleAssessmentScore = exports.saveResponses = exports.shuffleArray = exports.fetchQuestions = exports.updateDuration = exports.toggleActivation = exports.viewResults = exports.viewExamination = exports.viewActiveExamination = exports.deleteExamination = exports.viewExaminations = exports.createExamination = void 0;
const examinationModel_1 = __importDefault(require("../models/examinationModel"));
const questionBankModel_1 = __importDefault(require("../models/questionBankModel"));
const DataQueue_1 = require("../utils/DataQueue");
const candidateResponses_1 = __importDefault(require("../models/candidateResponses"));
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
            return Object.assign({ _id: exam._id, title: exam.title, id: index + 1, duration: exam.duration, active: exam.active }, stat);
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
    if (!req.student) {
        return res.status(403).send("This route is only accessible by students");
    }
    const examination = yield examinationModel_1.default.findOne({ active: true }).lean();
    if (!examination) {
        return res.status(404).send("No active examination found");
    }
    const hasTakenThisExamination = yield candidateResponses_1.default.exists({
        student: req.student._id,
        examination: examination._id,
    });
    res.send(Object.assign(Object.assign({}, examination), { hasTakenThisExamination: hasTakenThisExamination ? true : false }));
});
exports.viewActiveExamination = viewActiveExamination;
const viewExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.student) {
        return res.status(403).send("This route is only accessible by students");
    }
    const examination = yield examinationModel_1.default.findById(req.query.id);
    if (!examination) {
        return res.status(404).send("Examination not found");
    }
    const hasTakenThisExamination = yield candidateResponses_1.default.exists({
        student: req.student._id,
        examination: examination._id,
    });
    if (hasTakenThisExamination) {
        return res.status(400).send("You have already taken this examination");
    }
    res.send(examination);
});
exports.viewExamination = viewExamination;
const viewResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const responses = yield candidateResponses_1.default.find({
            student: (_a = req.student) === null || _a === void 0 ? void 0 : _a._id,
        })
            .select({ answers: 0 })
            .populate("examination", "title")
            .lean();
        const mapped = responses.map((response, id) => {
            return Object.assign(Object.assign({}, response), { id: id + 1 });
        });
        res.send(mapped);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
exports.viewResults = viewResults;
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
const updateDuration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield examinationModel_1.default.updateOne({ _id: req.query.id }, { duration: req.body.duration });
        res.send("Examination updated successfully");
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
exports.updateDuration = updateDuration;
const fetchQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examination = yield examinationModel_1.default.findOne({ _id: req.query.id });
        if (!examination) {
            return res.status(400).send("Examination not found");
        }
        const questionBank = yield questionBankModel_1.default.findOne({
            examination: req.query.id,
        });
        if (!questionBank) {
            return res.status(400).send("Question bank not found");
        }
        // const filteredQuestions = questionBank.questions.filter(
        //   (question) =>
        //     question.classCategory.toLowerCase() ===
        //     req.student?.classCategory.toLowerCase(),
        // );
        // if (filteredQuestions.length === 0) {
        //   return res.status(400).send("No questions for your class category");
        // }
        // const examQuestions = shuffleArray(filteredQuestions).map((q) => ({
        //   _id: q._id,
        //   question: q.question,
        //   options: shuffleArray(q.options),
        // }));
        // res.send({
        //   questions: examQuestions,
        //   examination,
        // });
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.fetchQuestions = fetchQuestions;
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
exports.shuffleArray = shuffleArray;
const responseQueue = new DataQueue_1.ConcurrentJobQueue({
    concurrency: 5,
    maxQueueSize: 10,
    retries: 3,
    retryDelay: 1000,
    shutdownTimeout: 30000,
});
const saveResponses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.student) {
            return res.sendStatus(401);
        }
        const body = Object.assign(Object.assign({}, req.body), { student: req.student._id, questionCategory: req.student.classCategory });
        responseQueue.enqueue(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, exports.handleAssessmentScore)(body);
        }));
        res.status(202).send("Responses saved successfully");
    }
    catch (error) {
        res.sendStatus(500);
    }
});
exports.saveResponses = saveResponses;
const handleAssessmentScore = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionBank = yield questionBankModel_1.default.findOne({
            examination: body.examination,
        });
        if (!questionBank)
            return;
        const filteredQuestions = questionBank.questions.filter((question) => question.classCategory.toLowerCase() ===
            body.questionCategory.toLowerCase());
        const questionMap = new Map(filteredQuestions.map((q) => [q._id.toString(), q.correctAnswer]));
        let correct = 0;
        for (const answer of body.answers) {
            if (questionMap.get(answer.questionId) === answer.selectedOption) {
                correct++;
            }
        }
        const score = Math.round((correct / filteredQuestions.length) * 100);
        yield candidateResponses_1.default.findOneAndUpdate({
            examination: body.examination,
            student: body.student,
            questionCategory: body.questionCategory,
        }, {
            $set: Object.assign(Object.assign({}, body), { score }),
        }, {
            upsert: true,
            new: true,
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.handleAssessmentScore = handleAssessmentScore;
const generateExamTranscript = (_a) => __awaiter(void 0, [_a], void 0, function* ({ examination, student, questionCategory, }) {
    console.log({
        examination,
        student,
        questionCategory,
    });
    const responseDoc = yield candidateResponses_1.default.findOne({
        examination,
        student,
        questionCategory,
    }).lean();
    if (!responseDoc) {
        throw new Error("Candidate response not found");
    }
    const questionBank = yield questionBankModel_1.default
        .findOne({
        examination,
    })
        .lean();
    if (!questionBank) {
        throw new Error("Question bank not found");
    }
    const questions = questionBank.questions.filter((q) => q.classCategory.toLowerCase() === questionCategory.toLowerCase());
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
    const transcript = responseDoc.answers.map((ans) => {
        const q = questionMap.get(ans.questionId);
        if (!q)
            return null;
        return {
            questionId: q._id,
            question: q.question,
            options: q.options,
            selectedAnswer: ans.selectedOption,
            correctAnswer: q.correctAnswer,
            isCorrect: ans.selectedOption === q.correctAnswer,
        };
    });
    return {
        examination,
        student,
        category: questionCategory,
        score: responseDoc.score,
        totalQuestions: questions.length,
        transcript: transcript.filter(Boolean),
    };
});
exports.generateExamTranscript = generateExamTranscript;
const getExamTranscript = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.student) {
            return res.sendStatus(401);
        }
        // const data = await generateExamTranscript({
        //   examination: req.query.examination as string,
        //   student: req.student?._id.toString() as string,
        //   // questionCategory: req.student?.classCategory as string,
        // });
        // res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
});
exports.getExamTranscript = getExamTranscript;
