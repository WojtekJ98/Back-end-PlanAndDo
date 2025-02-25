import Jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access denied, no token." });
    return;
  }
  try {
    const verified = Jwt.verify(token, process.env.JWT_SECRET || "") as any;
    if (!verified.id) {
      res.status(400).json({ error: "Invalid token data." });
      return;
    }

    (req as any).user = { id: verified.id }; // Attach user ID correctly
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};
