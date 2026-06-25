import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../types";

export async function getBoards(req: AuthRequest, res: Response) {
  const boards = await prisma.board.findMany({
    where: { userId: req.userId },
    include: { columns: { include: { cards: { orderBy: { position: "asc" } } }, orderBy: { position: "asc" } } },
  });
  res.json(boards);
}

export async function createBoard(req: AuthRequest, res: Response) {
  const { title } = req.body;
  const board = await prisma.board.create({
    data: {
      title,
      userId: req.userId!,
      columns: {
        create: [
          { title: "To Do", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Done", position: 2 },
        ],
      },
    },
    include: { columns: { include: { cards: true }, orderBy: { position: "asc" } } },
  });
  res.status(201).json(board);
}

export async function updateBoard(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { title } = req.body;
  try {
    const existing = await prisma.board.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Board not found" });
    }
    const board = await prisma.board.update({
      where: { id },
      data: { title },
    });
    res.json(board);
  } catch (err) {
    console.error("Error updating board:", err);
    res.status(500).json({ error: "Failed to update board" });
  }
}

export async function deleteBoard(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await prisma.board.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ error: "Board not found" });
  }
  await prisma.board.delete({ where: { id } });
  res.status(204).send();
}
