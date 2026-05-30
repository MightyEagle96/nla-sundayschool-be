"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherModel = void 0;
const mongoose_1 = require("mongoose");
const teacherSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    isConfirmed: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true, trim: true, unique: true },
    classCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: "ClassCategory" },
    classData: { type: mongoose_1.Schema.Types.ObjectId, ref: "Class" },
    gender: { type: String, required: true },
    role: { type: String, default: "teacher" },
    adminRights: { type: Boolean, default: false },
}, { timestamps: true });
teacherSchema.index({ phoneNumber: 1 }, { unique: true });
exports.TeacherModel = (0, mongoose_1.model)("Teacher", teacherSchema);
