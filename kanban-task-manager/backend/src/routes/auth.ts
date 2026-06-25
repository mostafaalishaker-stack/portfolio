import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma";
import { register, login } from "../controllers/auth";
import { AuthRequest } from "../types";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later" },
});

const jwtSecret = process.env.JWT_SECRET || "";
const router = Router();
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

router.get("/me", async (req: AuthRequest, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = user;
    res.json(safe);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
