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
const allowedOrigins = [
  "https://plan-and-do-wojtelos-projects.vercel.app",
  "https://plan-and-do-kappa.vercel.app",
  "https://plan-and-do-git-main-wojtelos-projects.vercel.app",
  "http://localhost:5173",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH ,DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/boards", boardRoutes);

// ✅ Error Handling Middleware (To Prevent 404 on OPTIONS)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Database Connection

const mongoURI = process.env.MONGO_URI as string;

if (!mongoURI) {
  console.error("❌ MONGO_URI is not set!");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error: ", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;
