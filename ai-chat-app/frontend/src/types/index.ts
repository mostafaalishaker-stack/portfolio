export interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Chat {
  _id: string;
  userId: string;
  title: string;
  messages: Message[];
}
