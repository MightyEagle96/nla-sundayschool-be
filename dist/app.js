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
exports.syncIndexes = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const router_1 = __importDefault(require("./router/router"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path = require("path");
const mongoose_1 = __importDefault(require("mongoose"));
const syncIndexes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔄 Syncing indexes...");
        for (const name in mongoose_1.default.models) {
            console.log(`→ ${name}`);
            yield mongoose_1.default.models[name].syncIndexes();
        }
        console.log("✅ Index sync complete");
    }
    catch (err) {
        console.error("❌ Index sync failed:", err);
    }
});
exports.syncIndexes = syncIndexes;
// import crypto from "crypto";
// const secret1 = crypto.randomBytes(256).toString("base64");
// const secret2 = crypto.randomBytes(256).toString("base64");
// console.log({ secret1, secret2 });
dotenv_1.default.config();
// const cleanupFunction = async () => {
//   try {
//     const docs = await CandidateResponses.find({
//       questionCategory: { $type: "string" },
//     }).lean(false); // ensure mongoose docs
//     for (const doc of docs) {
//       await CandidateResponses.updateOne(
//         { _id: doc._id },
//         {
//           $set: {
//             questionCategory: new mongoose.Types.ObjectId(doc.questionCategory),
//           },
//         },
//       );
//     }
//     console.log("Migration done");
//   } catch (error: any) {
//     console.error(error.message);
//   }
// };
(0, database_1.ConnectDatabase)();
//cleanupFunction();
const app = (0, express_1.default)();
const whitelist = [
    "http://192.168.137.1:5173",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://nla-sundayschool-be.onrender.com",
    "https://www.rccgnlass.com",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true); // Allow request
        }
        else {
            callback(new Error("Not allowed by CORS")); // Block request
        }
    },
    credentials: true, // If you use cookies/sessions
};
app
    .use((0, morgan_1.default)("dev"))
    .use((0, cookie_parser_1.default)())
    .use((0, cors_1.default)(corsOptions))
    .use(express_1.default.json({ limit: "50mb" }))
    .use(express_1.default.static(path.join(__dirname, "build")))
    .use("/api", router_1.default)
    .get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
})
    .listen(4000, "0.0.0.0", () => {
    console.log("App is listening");
});
