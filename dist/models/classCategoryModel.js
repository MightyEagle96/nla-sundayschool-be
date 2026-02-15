"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String, lowercase: true },
}, { timestamps: true });
const ClassCategoryModel = (0, mongoose_1.model)("ClassCategory", schema);
exports.default = ClassCategoryModel;
