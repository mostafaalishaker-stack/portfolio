import { Router } from "express";
import { getChats, createChat, deleteChat, sendMessage } from "../controllers/chat.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", getChats);
router.post("/", createChat);
router.delete("/:id", deleteChat);
router.post("/:id/messages", sendMessage);
export default router;
