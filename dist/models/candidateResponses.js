"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    examination: { type: mongoose_1.Schema.Types.ObjectId, ref: "Examination" },
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student" },
    questionCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: "ClassCategory" },
    answers: [
        {
            questionId: String,
            selectedOption: String,
        },
    ],
    score: { type: Number, default: 0 },
}, { timestamps: true });
const CandidateResponses = (0, mongoose_1.model)("CandidateResponses", schema);
exports.default = CandidateResponses;
