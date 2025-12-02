"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    title: { type: String, unique: true, trim: true, lowercase: true },
    dateScheduled: Date,
    timeScheduled: Date,
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Teacher" },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Examination", schema);
