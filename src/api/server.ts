import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "../routes/authRoutes";
import dashboardRoutes from "../routes/dashboardRoutes";
import boardRoutes from "../routes/boardRoutes";

dotenv.config();

const app: Application = express();
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://plan-and-do-wojtelos-projects.vercel.app/"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(
  cors({
    origin: "https://plan-and-do-wojtelos-projects.vercel.app/",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/boards", boardRoutes);

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error: ", err));

export default app;
