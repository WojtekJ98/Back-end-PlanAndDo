import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "../routes/authRoutes";
import dashboardRoutes from "../routes/dashboardRoutes";
import boardRoutes from "../routes/boardRoutes";

dotenv.config();

const app: Application = express();
app.use(express.json());

// ✅ CORS Configuration
const allowedOrigins = ["https://plan-and-do-wojtelos-projects.vercel.app"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/boards", boardRoutes);

// ✅ Error Handling Middleware (To Prevent 404 on OPTIONS)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Database Connection
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error: ", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;
