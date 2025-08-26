import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { ConnectDatabase } from "./database";
import appRouter from "./router/router";
import cors from "cors";

// import crypto from "crypto";

// const secret1 = crypto.randomBytes(64).toString("hex");
// const secret2 = crypto.randomBytes(64).toString("hex");

// console.log({ secret1, secret2 });

dotenv.config();

ConnectDatabase();
const app = express();

app

  .use(morgan("dev"))

  .use(cors())

  .use(express.json({ limit: "50mb" }))

  .use("/api", appRouter)

  .listen(4000, "0.0.0.0", () => {
    console.log("App is listening");
  });
