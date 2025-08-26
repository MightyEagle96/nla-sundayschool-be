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
exports.authenticateToken = exports.generateRefreshToken = exports.generateToken = exports.tokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const studentModel_1 = require("../models/studentModel");
dotenv_1.default.config();
exports.tokens = {
    auth_token: "auth_token",
    refresh_token: "refresh_token",
};
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
    });
}
exports.generateToken = generateToken;
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN, {
        expiresIn: "2d",
    });
}
exports.generateRefreshToken = generateRefreshToken;
// Middleware to protect routes
// export async function authenticateToken(
//   req: AuthenticatedStudent,
//   res: Response,
//   next: NextFunction
// ) {
//   const token = req.cookies[`${tokens.auth_token}`];
//   if (!token) {
//     res.status(401).send("Not authenticated");
//     return;
//   }
//   try {
//     const user = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as IStudent;
//     const student = await StudentModel.findById(user._id);
//     if (!student) {
//       res.status(401).send("Not authenticated");
//       return;
//     }
//     req.student = user;
//     next();
//   } catch (err) {
//     res.status(403).json({ message: "Invalid token" });
//   }
// }
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get token from cookie
            const token = req.cookies[exports.tokens.auth_token];
            if (!token) {
                return res.status(401).json({ message: "Not authenticated" });
            }
            // Verify JWT
            const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN);
            if (!(decoded === null || decoded === void 0 ? void 0 : decoded._id)) {
                return res.status(403).json({ message: "Invalid token payload" });
            }
            // Check student in DB
            const student = yield studentModel_1.StudentModel.findById(decoded._id).lean();
            if (!student) {
                return res.status(401).json({ message: "Not authenticated" });
            }
            // Attach to request
            req.student = student;
            next();
        }
        catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token expired" });
            }
            return res.status(403).json({ message: "Invalid token" });
        }
    });
}
exports.authenticateToken = authenticateToken;
