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
exports.StudentModel = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const studentSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    isConfirmed: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true, trim: true },
    classCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: "ClassCategory" },
    classData: { type: mongoose_1.Schema.Types.ObjectId, ref: "Class" },
    role: { type: String, default: "student" },
    // title: { type: String, required: true },
    gender: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 }, // ✅ enforce length
    disabled: { type: Boolean, default: false },
}, { timestamps: true });
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ phoneNumber: 1 }, { unique: true });
studentSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        const salt = yield bcrypt_1.default.genSalt(10);
        this.password = yield bcrypt_1.default.hash(this.password, salt);
        next();
    });
});
exports.StudentModel = (0, mongoose_1.model)("Student", studentSchema);
