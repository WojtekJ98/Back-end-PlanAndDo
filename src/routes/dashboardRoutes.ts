import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, (req, res) => {
  res.json({ message: "Welcome to the dashboard!" });
});

export default router;
