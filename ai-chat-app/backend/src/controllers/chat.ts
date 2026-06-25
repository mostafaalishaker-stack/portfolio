import { Response } from "express";
import OpenAI from "openai";
import { Chat } from "../models/Chat.js";
import { AuthRequest } from "../types/index.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("FATAL: OPENAI_API_KEY environment variable is not set");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function getChats(req: AuthRequest, res: Response) {
  const chats = await Chat.find({ userId: req.userId }).sort({ updatedAt: -1 });
  res.json(chats);
}

export async function createChat(req: AuthRequest, res: Response) {
  const chat = await Chat.create({ userId: req.userId });
  res.status(201).json(chat);
}

export async function deleteChat(req: AuthRequest, res: Response) {
  await Chat.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.status(204).send();
}

export async function sendMessage(req: AuthRequest, res: Response) {
  const { chatId, message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const chat = await Chat.findOne({ _id: chatId, userId: req.userId });
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  chat.messages.push({ role: "user", content: message, createdAt: new Date() });

  if (chat.title === "New Chat") {
    chat.title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chat.messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
    chat.messages.push({ role: "assistant", content: reply, createdAt: new Date() });
    await chat.save();

    res.json({ reply, chat });
  } catch (err) {
    console.error("AI service error:", err);
    res.status(500).json({ error: "AI service error. Check your API key." });
  }
}
