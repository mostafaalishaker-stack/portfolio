if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) { document.documentElement.classList.add('dark'); }

import React, { useState, Component, ErrorInfo, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Login } from "./components/Login";
import { ChatView } from "./components/ChatView";
import "./index.css";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Error boundary caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center">
        <div><h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
        <button onClick={() => window.location.reload()} className="bg-indigo-600 px-6 py-2 rounded-lg">Reload</button></div>
      </div>;
    }
    return this.props.children;
  }
}

const tokenFromStorage = localStorage.getItem("token");

function App() {
  const [token, setToken] = useState<string | null>(tokenFromStorage);

  if (!token) return <Login onLogin={setToken} />;
  return <ChatView onLogout={() => { localStorage.removeItem("token"); setToken(null); }} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" } }} />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
