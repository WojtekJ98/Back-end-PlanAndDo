import express, { Application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "../routes/authRoutes";
import dashboardRoutes from "../routes/dashboardRoutes";
import boardRoutes from "../routes/boardRoutes";

dotenv.config();

const app: Application = express();
app.use(express.json());

app.use(
  cors({
    origin: "https://plan-and-do-wojtelos-projects.vercel.app", // No trailing slash
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
