import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../api/client";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      api.get("/auth/me").then((res) => setUser(res.data)).catch(() => logout());
    }
  }, [token]);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    // In production, use httpOnly cookies instead of localStorage for better XSS protection
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(email: string, name: string, password: string) {
    const { data } = await api.post("/auth/register", { email, name, password });
    // In production, use httpOnly cookies instead of localStorage for better XSS protection
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
