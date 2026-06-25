import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/boards";
import cardRoutes from "./routes/cards";

const app = express();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-me-to-a-random-secret") {
  console.error("FATAL: Set JWT_SECRET to a strong random value in .env");
  process.exit(1);
}

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/cards", cardRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
