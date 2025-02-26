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
app.options("*", (req, res) => {
  console.log("Preflight request received");
  res.header(
    "Access-Control-Allow-Origin",
    "https://plan-and-do-wojtelos-projects.vercel.app"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.send();
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/boards", boardRoutes);

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error: ", err));

export default app;
