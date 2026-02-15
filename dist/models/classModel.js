"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String, lowercase: true },
    classCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: "ClassCategory" },
}, { timestamps: true });
const ClassModel = (0, mongoose_1.model)("Class", schema);
exports.default = ClassModel;
