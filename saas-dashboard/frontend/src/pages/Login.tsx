import { useState } from 'react';
import { showToast } from '../utils/toast';

interface Props { onLogin: (token: string) => void }

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: email.split('@')[0] }),
      });
      const data = await res.json();
      if (data.token) { showToast(isRegister ? 'Account created successfully!' : 'Signed in successfully!', 'success'); onLogin(data.token); }
      else setErrorMessage(data.error || 'Authentication failed');
    } catch (err) { console.error('Login failed:', err); setErrorMessage('Network error'); showToast('Network error', 'error'); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>SaaS Dashboard</div>
          <p style={{ color: '#94a3b8', fontSize: '.9rem' }}>{isRegister ? 'Create your account' : 'Sign in to your account'}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email" style={{ display: 'block', fontSize: '.85rem', color: '#94a3b8', marginBottom: 6 }}>Email</label>
          <input id="login-email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required aria-describedby="login-error" style={{ width: '100%', padding: 14, borderRadius: 10, border: '1px solid #1e293b', background: '#0b1120', color: '#f1f5f9', fontSize: '.95rem', marginBottom: 16, outline: 'none', boxSizing: 'border-box' }} />
          <label htmlFor="login-password" style={{ display: 'block', fontSize: '.85rem', color: '#94a3b8', marginBottom: 6 }}>Password</label>
          <input id="login-password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} aria-describedby="login-error" style={{ width: '100%', padding: 14, borderRadius: 10, border: '1px solid #1e293b', background: '#0b1120', color: '#f1f5f9', fontSize: '.95rem', marginBottom: 24, outline: 'none', boxSizing: 'border-box' }} />
          <div id="login-error" role="alert" aria-live="assertive" style={{ color: '#ef4444', fontSize: '.85rem', marginBottom: 12, display: errorMessage ? 'block' : 'none' }}>{errorMessage}</div>
          <button type="submit" disabled={loading} aria-label={loading ? 'Loading' : isRegister ? 'Create Account' : 'Sign In'} style={{ width: '100%', padding: 14, borderRadius: 10, background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', border: 'none', transition: '.3s', opacity: loading ? .6 : 1 }}>
            {loading ? <i className="fas fa-spinner fa-spin" aria-label="Loading"></i> : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#94a3b8', fontSize: '.85rem' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
           <button type="button" onClick={() => { setIsRegister(!isRegister); setErrorMessage(''); }} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600, fontSize: '.85rem' }}>{isRegister ? 'Sign In' : 'Register'}</button>
        </p>
      </div>
    </div>
  );
}
