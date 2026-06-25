import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../types";

async function verifyCardOwnership(cardId: string, userId: string): Promise<boolean> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: { include: { board: true } } },
  });
  return card !== null && card.column.board.userId === userId;
}

export async function createCard(req: AuthRequest, res: Response) {
  const { title, description, columnId, dueDate, labels } = req.body;
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });
  if (!column || column.board.userId !== req.userId) {
    return res.status(404).json({ error: "Column not found" });
  }
  const count = await prisma.card.count({ where: { columnId } });
  const card = await prisma.card.create({
    data: { title, description, columnId, position: count, dueDate: dueDate ? new Date(dueDate) : null, labels: labels || [] },
  });
  res.status(201).json(card);
}

export async function updateCard(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { title, description, dueDate, labels } = req.body;
  if (!(await verifyCardOwnership(id, req.userId!))) {
    return res.status(404).json({ error: "Card not found" });
  }
  const card = await prisma.card.update({
    where: { id },
    data: { title, description, dueDate: dueDate ? new Date(dueDate) : null, labels },
  });
  res.json(card);
}

export async function deleteCard(req: AuthRequest, res: Response) {
  const { id } = req.params;
  if (!(await verifyCardOwnership(id, req.userId!))) {
    return res.status(404).json({ error: "Card not found" });
  }
  await prisma.card.delete({ where: { id } });
  res.status(204).send();
}

export async function moveCard(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { columnId, position } = req.body;
  if (!(await verifyCardOwnership(id, req.userId!))) {
    return res.status(404).json({ error: "Card not found" });
  }
  const targetColumn = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });
  if (!targetColumn || targetColumn.board.userId !== req.userId) {
    return res.status(404).json({ error: "Target column not found" });
  }
  const card = await prisma.card.update({
    where: { id },
    data: { columnId, position },
  });
  res.json(card);
}
