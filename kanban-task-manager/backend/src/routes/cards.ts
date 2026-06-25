import { Router } from "express";
import { createCard, updateCard, deleteCard, moveCard } from "../controllers/cards";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);
router.patch("/:id/move", moveCard);
export default router;
