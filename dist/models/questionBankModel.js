"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const schema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: "Teacher" },
    isTaken: { type: Boolean, default: false },
    dateCreated: { type: Date },
    dateTaken: Date,
    questions: [
        {
            question: String,
            questionId: String,
            options: [String],
            correctAnswer: String,
            authoredBy: { type: Schema.Types.ObjectId, ref: "Teacher" },
        },
    ],
    classCategory: String,
    bankName: String,
}, { timestamps: true });
exports.default = model("QuestionBank", schema);
