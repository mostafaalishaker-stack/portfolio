import React, { Component, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Login } from "./components/Login";
import { Board } from "./components/Board";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-red-600">Something went wrong. Please refresh the page.</p></div> : this.props.children;
  }
}

function App() {
  const { user } = useAuth();
  return user ? <Board /> : <Login />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
