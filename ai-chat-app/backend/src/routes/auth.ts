import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/auth.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
export default router;
