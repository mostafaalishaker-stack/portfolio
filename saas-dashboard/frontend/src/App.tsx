import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const styles = { app: { minHeight: '100vh', background: '#0b1120', color: '#f1f5f9' } };

export default function App() {
  // TODO: For production, use httpOnly cookies instead of localStorage
  // to protect against XSS attacks. Store the token in a secure, httpOnly cookie
  // set by the server and use CSRF tokens for state-changing requests.
  const [token, setToken] = useState(localStorage.getItem('saas_token'));

  const handleLogin = (t: string) => {
    localStorage.setItem('saas_token', t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('saas_token');
    setToken(null);
  };

  return (
    <div style={styles.app}>
      {token ? <Dashboard token={token} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </div>
  );
}
