import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("FATAL: MONGODB_URI environment variable is not set");
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.get("/api/health", (_: Request, res: Response) => res.json({ status: "ok" }));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI).then(() => {
  console.log("Connected to MongoDB");
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        console.log("Closed database connection");
        process.exit(0);
      });
    });
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}).catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
