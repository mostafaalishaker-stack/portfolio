import { Router } from "express";
import { getBoards, createBoard, updateBoard, deleteBoard } from "../controllers/boards";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", getBoards);
router.post("/", createBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);
export default router;
