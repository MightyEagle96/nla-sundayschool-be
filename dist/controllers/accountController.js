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
exports.getRefreshToken = exports.logout = exports.logoutAccount = exports.myProfile = exports.loginAccount = exports.createAccount = void 0;
//Create Account
const bcrypt_1 = __importDefault(require("bcrypt"));
const studentModel_1 = require("../models/studentModel");
const DataQueue_1 = require("../utils/DataQueue");
const jwtController_1 = require("./jwtController");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const teacherModel_1 = require("../models/teacherModel");
const accountQueue = new DataQueue_1.ConcurrentJobQueue(4, 10);
// export const createAccount = async (req: Request, res: Response) => {
//   try {
//     const body: IStudent = req.body;
//     const existing = await StudentModel.findOne({
//       $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
//     });
//     if (existing) {
//       return res.status(400).send("Account already exists");
//     }
//     res.send("Account is being created");
//     queue
//       .enqueue(async () => {
//         const student = new StudentModel(body);
//         await student.save();
//         const activationLink = `http://localhost:5173/activate/${student._id}`;
//         await sendEmailFunc(
//           student.email,
//           "Activate your account",
//           notificationEmailTemplate(
//             `${student.firstName} ${student.lastName}`,
//             activationLink
//           )
//         );
//       })
//       .then(() => {
//         // res.status(200).send("Account created successfully");
//       })
//       .catch((err) => {
//         console.error("Queue job failed:", err);
//         // res.status(500).send("Error creating account");
//       });
//   } catch (error) {
//     console.error("Request error:", error);
//     res.status(500).send("Internal server error");
//   }
// };
//Verify Email
//Verify Account
//Login
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAccount = yield studentModel_1.StudentModel.findOne({
        email: req.body.email,
    });
    if (existingAccount) {
        return res.status(400).send("Account already exists");
    }
    accountQueue.enqueue(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield studentModel_1.StudentModel.create(req.body);
        }
        catch (error) {
            console.log(error);
        }
    }));
    res.send("Account created successfully");
});
exports.createAccount = createAccount;
const loginAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const existing = yield studentModel_1.StudentModel.findOne({
        $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
    });
    if (!existing) {
        return res.status(400).send("Account not found");
    }
    bcrypt_1.default.compare(body.password, existing.password).then((result) => {
        if (result) {
            const accessToken = (0, jwtController_1.generateToken)({
                _id: existing._id,
                email: existing.email,
                role: "student",
            });
            const refreshToken = (0, jwtController_1.generateRefreshToken)({
                _id: existing._id,
                email: existing.email,
                role: "student",
            });
            // res.send("Account logged in successfully");
            res
                .cookie(jwtController_1.tokens.auth_token, accessToken, {
                httpOnly: false,
                secure: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 1000 * 60 * 60, // 1h
            })
                .cookie(jwtController_1.tokens.refresh_token, refreshToken, {
                httpOnly: false,
                secure: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
            })
                .send("Logged In");
        }
        else {
            res.status(400).send("Invalid credentials");
        }
    });
});
exports.loginAccount = loginAccount;
const myProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.student) {
        res.send(req.student);
    }
    if (req.teacher) {
        req.teacher.role === "teacher";
        res.send(req.teacher);
    }
});
exports.myProfile = myProfile;
const logoutAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .clearCookie(jwtController_1.tokens.auth_token)
        .clearCookie(jwtController_1.tokens.refresh_token)
        .send("Logged Out");
});
exports.logoutAccount = logoutAccount;
//Change Password
//Delete Account
//Get Account Details
//Update Account Details
//Get All Accounts
//Delete Account
//Update Account
//Get Account
//Logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie(jwtController_1.tokens.auth_token, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.clearCookie(jwtController_1.tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.send("Logged Out");
});
exports.logout = logout;
const getRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies[jwtController_1.tokens.refresh_token];
    if (!refreshToken) {
        return res.status(401).send("Not authenticated");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN);
        const student = yield studentModel_1.StudentModel.findById(decoded._id);
        const teacher = yield teacherModel_1.TeacherModel.findById(decoded._id);
        if (student) {
            const accessToken = (0, jwtController_1.generateToken)({
                _id: student._id,
                email: student.email,
                role: "student",
            });
            const newRefreshToken = (0, jwtController_1.generateRefreshToken)({
                _id: student._id,
                email: student.email,
                role: "student",
            });
            return res
                .cookie(jwtController_1.tokens.auth_token, accessToken, {
                httpOnly: false,
                secure: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 1000 * 60 * 60, // 1h
            })
                .cookie(jwtController_1.tokens.refresh_token, newRefreshToken, {
                httpOnly: false,
                secure: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
            })
                .send("Logged In");
            //console.log("na here o");
            //return res.status(401).send("Invalid refresh token");
        }
        if (teacher) {
            const accessToken = (0, jwtController_1.generateToken)({
                _id: teacher._id,
                email: teacher.email,
                role: "teacher",
            });
            const refreshToken = (0, jwtController_1.generateRefreshToken)({
                _id: teacher._id,
                email: teacher.email,
                role: "teacher",
            });
            return res
                .cookie(jwtController_1.tokens.auth_token, accessToken, {
                httpOnly: false,
                secure: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 1000 * 60 * 60, // 1h
            })
                .cookie(jwtController_1.tokens.refresh_token, refreshToken, {
                httpOnly: false,
                secure: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
            })
                .send("Logged In");
        }
        return res.status(401).send("Invalid refresh token");
    }
    catch (error) {
        res.status(401).send("Invalid refresh token");
    }
    //  res.send(req.cookies[tokens.refresh_token]);
});
exports.getRefreshToken = getRefreshToken;
