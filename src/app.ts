import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

import { ConnectDatabase } from "./database";
import appRouter from "./router/router";
import cors from "cors";
import cookieParser from "cookie-parser";
import path = require("path");
import mongoose from "mongoose";
import CandidateResponses from "./models/candidateResponses";

export const syncIndexes = async () => {
  try {
    console.log("🔄 Syncing indexes...");
    for (const name in mongoose.models) {
      console.log(`→ ${name}`);
      await mongoose.models[name].syncIndexes();
    }
    console.log("✅ Index sync complete");
  } catch (err) {
    console.error("❌ Index sync failed:", err);
  }
};
// import crypto from "crypto";

// const secret1 = crypto.randomBytes(256).toString("base64");
// const secret2 = crypto.randomBytes(256).toString("base64");

// console.log({ secret1, secret2 });

dotenv.config();
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

ConnectDatabase();
//cleanupFunction();
const app = express();

const whitelist = [
  "http://192.168.137.1:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://nla-sundayschool-be.onrender.com",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("Not allowed by CORS")); // Block request
    }
  },
  credentials: true, // If you use cookies/sessions
};

app

  .use(morgan("dev"))

  .use(cookieParser())

  .use(cors(corsOptions))

  .use(express.json({ limit: "50mb" }))

  .use(express.static(path.join(__dirname, "build")))

  .use("/api", appRouter)

  .get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  })

  .listen(4000, "0.0.0.0", () => {
    console.log("App is listening");
  });
