import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import { Chat, Message } from "../types";
import { SearchBar } from "./SearchBar";
import { SkeletonList } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";

interface Props {
  onLogout: () => void;
}

const CHATS_PER_PAGE = 10;

export function ChatView({ onLogout }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [chatPage, setChatPage] = useState(1);
  const [totalChats, setTotalChats] = useState(0);
  const [chatSearch, setChatSearch] = useState("");
  const msgEnd = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);

  const filteredChats = useMemo(() => {
    if (!chatSearch) return chats;
    return chats.filter(c => c.title.toLowerCase().includes(chatSearch.toLowerCase()));
  }, [chats, chatSearch]);

  const totalChatPages = Math.ceil(totalChats / CHATS_PER_PAGE);

  useEffect(() => {
    api.get(`/chats?page=${chatPage}&limit=${CHATS_PER_PAGE}`).then((res) => {
      setChats(res.data.chats || res.data);
      setTotalChats(res.data.total || (Array.isArray(res.data) ? res.data.length : 0));
      setFetchError(false);
    }).catch(() => {
      setFetchError(true);
      toast.error("Failed to load chats");
    }).finally(() => {
      setInitialLoading(false);
    });
  }, [chatPage]);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  async function selectChat(chat: Chat) {
    setActiveChat(chat);
  }

  async function newChat() {
    try {
      const { data } = await api.post("/chats");
      setChats([data, ...chats]);
      setActiveChat(data);
    } catch {
      toast.error("Failed to create new chat");
    }
  }

  async function deleteChat(id: string) {
    const prevChats = [...chats];
    const prevActive = activeChat;
    setChats(chats.filter((c) => c._id !== id));
    if (activeChat?._id === id) {
      const remaining = chats.filter((c) => c._id !== id);
      setActiveChat(remaining.length > 0 ? remaining[0] : null);
    }
    try {
      await api.delete(`/chats/${id}`);
    } catch {
      setChats(prevChats);
      setActiveChat(prevActive);
      toast.error("Failed to delete chat");
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeChat || loading) return;
    setLoading(true);
    const message = input;
    setInput("");

    const tempMsg: Message = { role: "user", content: message, createdAt: new Date().toISOString() };
    setActiveChat((prev) => prev ? { ...prev, messages: [...prev.messages, tempMsg] } : prev);

    try {
      const { data } = await api.post(`/chats/${activeChat._id}/messages`, { message });
      const updated = data.chat;
      setActiveChat(updated);
      setChats(chats.map((c) => (c._id === updated._id ? updated : c)));
    } catch {
      setActiveChat((prev) => prev ? { ...prev, messages: prev.messages.filter(m => m !== tempMsg) } : prev);
      toast.error("Error sending message");
    } finally {
      setLoading(false);
    }
  }

  const handleChatKeyDown = useCallback((e: React.KeyboardEvent, chat: Chat) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectChat(chat);
    }
  }, []);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <div className="w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 space-y-3">
          <button onClick={newChat}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2">
            <i className="fas fa-plus"></i> New Chat
          </button>
          <SearchBar value={chatSearch} onChange={setChatSearch} placeholder="Search chats..." />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1" ref={chatListRef} role="listbox" aria-label="Chat history">
          {initialLoading ? (
            <div className="p-4 space-y-3">
              <SkeletonList count={5} />
            </div>
          ) : filteredChats.length === 0 ? (
            <EmptyState icon="💬" title={chatSearch ? "No matching chats" : "No chats yet"} message={chatSearch ? "Try a different search term." : "Start a new conversation"} action={chatSearch ? undefined : { label: "New Chat", onClick: newChat }} />
          ) : (
            <>
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  onKeyDown={(e) => handleChatKeyDown(e, chat)}
                  role="option"
                  tabIndex={0}
                  aria-selected={activeChat?._id === chat._id}
                  className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group text-sm transition
                    ${activeChat?._id === chat._id ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"}`}
                >
                  <span className="truncate flex-1"><i className="fas fa-message mr-2 text-xs"></i>{chat.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteChat(chat._id); }}
                    aria-label={`Delete ${chat.title}`}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              ))}
              <Pagination currentPage={chatPage} totalPages={totalChatPages} onPageChange={setChatPage} />
            </>
          )}
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <button onClick={onLogout} aria-label="Logout"
            className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400">
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeChat.messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <i className="fas fa-robot text-7xl mb-4 opacity-30"></i>
                  <p className="text-xl font-medium">Ask me anything!</p>
                  <p className="text-sm mt-1">Powered by OpenAI GPT-4o</p>
                </div>
              )}
              {activeChat.messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                  )}
                  <div className={`max-w-2xl p-4 rounded-2xl ${msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-md"
                    : "bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-md"}`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-user text-gray-600 dark:text-gray-300 text-xs"></i>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <i className="fas fa-robot text-white text-xs"></i>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={msgEnd} />
            </div>

            <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  aria-label="Message input"
                  className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button onClick={sendMessage} disabled={loading}
                  className="bg-indigo-600 text-white px-6 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <i className="fas fa-robot text-8xl mb-4 opacity-20"></i>
              <p className="text-xl">Select a chat or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
