"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shema = new mongoose_1.Schema({
    yayaClass: String,
    adultClass: String,
    scheduleDate: Date,
}, { timestamps: true });
const TopicSchedule = (0, mongoose_1.model)("TopicSchedule", shema);
exports.default = TopicSchedule;
