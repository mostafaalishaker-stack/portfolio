import { useState } from 'react';
import { api } from '../api/client.js';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'employer' | 'candidate';
}

interface Props {
  onLogin: (token: string, user: UserData) => void;
}

export default function Login({ onLogin }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employer' | 'candidate'>('candidate');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body: Record<string, unknown> = { email, password };
      if (isRegister) body.name = name;
      if (isRegister) body.role = role;
      const res = await api.post(endpoint, body);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response: { data: { error?: string } } }).response?.data?.error
        : 'Something went wrong';
      setError(msg || 'Something went wrong');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px', marginBottom: '12px',
    background: '#131c31', border: '1px solid #1e293b', borderRadius: '8px',
    color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ background: '#131c31', padding: '40px', borderRadius: '16px', border: '1px solid #1e293b', width: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '28px', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Job Board
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '20px', color: '#e2e8f0' }}>
          {isRegister ? 'Create Account' : 'Sign In'}
        </h2>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="reg-name" style={labelStyle}>Name</label>
              <input id="reg-name" style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </>
          )}
          <label htmlFor="reg-email" style={labelStyle}>Email</label>
          <input id="reg-email" style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
          <label htmlFor="reg-password" style={labelStyle}>Password</label>
          <input id="reg-password" style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          {isRegister && (
            <div style={{ marginBottom: '16px' }} role="radiogroup" aria-label="Role">
              <label style={labelStyle}>Role</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="role" value="candidate" checked={role === 'candidate'} onChange={() => setRole('candidate')} />
                  Candidate
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="role" value="employer" checked={role === 'employer'} onChange={() => setRole('employer')} />
                  Employer
                </label>
              </div>
            </div>
          )}
          <button type="submit" style={{
            width: '100%', padding: '12px', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            border: 'none', borderRadius: '8px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
          }}>
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
