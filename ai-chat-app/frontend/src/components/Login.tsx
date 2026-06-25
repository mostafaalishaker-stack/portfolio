import { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

interface Props {
  onLogin: (token: string) => void;
}

export function Login({ onLogin }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister ? { email, name, password } : { email, password };
      const { data } = await api.post(endpoint, body);
      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } catch (err) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response: { data: { error: string } } }).response?.data?.error
        : "Something went wrong";
      toast.error(message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <i className="fas fa-robot text-5xl text-indigo-500 mb-3"></i>
          <h1 className="text-3xl font-bold dark:text-white">AI Chat</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Powered by OpenAI</p>
        </div>
        {isRegister && (
          <>
            <label htmlFor="name-input" className="sr-only">Name</label>
            <input id="name-input" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full px-4 py-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
          </>
        )}
        <label htmlFor="email-input" className="sr-only">Email</label>
        <input id="email-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full px-4 py-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
        <label htmlFor="password-input" className="sr-only">Password</label>
        <input id="password-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full px-4 py-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
        <button type="submit" disabled={submitting}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <><i className="fas fa-spinner fa-spin"></i> Please wait...</> : (isRegister ? "Register" : "Login")}
        </button>
        <p className="text-center mt-4 text-sm text-gray-500">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-indigo-500 font-semibold ml-1">
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}
