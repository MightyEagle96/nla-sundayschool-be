import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { ConnectDatabase } from "./database";
import appRouter from "./router/router";
import cors from "cors";

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
