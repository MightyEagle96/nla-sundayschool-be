"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student" },
    classCategory: String,
    className: String,
    timeLogged: Date,
}, { timestamps: true });
const AttendanceReport = (0, mongoose_1.model)("AttendanceReport", schema);
exports.default = AttendanceReport;
