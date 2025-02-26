import express, { Application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import boardRoutes from "./routes/boardRoutes";
import { VercelRequest, VercelResponse } from "@vercel/node";

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/boards", boardRoutes);

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error: ", err));

const PORT = process.env.PORT;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default (req: VercelRequest, res: VercelResponse) => app(req, res);
