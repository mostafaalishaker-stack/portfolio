import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { AuthRequest, auth } from '../middleware/auth.js';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your-secret-key') throw new Error('JWT_SECRET environment variable is not set');
  return secret;
};

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, please try again later' } });
router.use(authLimiter);

/**
 * In-memory user storage — for demo/portfolio purposes only.
 * Replace with a database (e.g. PostgreSQL via Prisma) in production.
 */
const users: { email: string; password: string; name: string; orgId: string; role: string }[] = [];

const validateEmail = (email: unknown): email is string => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password: unknown): password is string => typeof password === 'string' && password.length >= 6;
const validateName = (name: unknown): name is string => typeof name === 'string' && name.length >= 1 && name.length <= 100;

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!validateEmail(email) || !validatePassword(password) || !validateName(name)) {
      return res.status(400).json({ error: 'Invalid input: email, password (min 6 chars), and name required' });
    }
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
    const hashed = await bcrypt.hash(password, 10);
    const orgId = `org_${Date.now()}`;
    users.push({ email, password: hashed, name, orgId, role: 'admin' });
    const token = jwt.sign({ email, orgId, role: 'admin' }, getJwtSecret(), { expiresIn: '7d' });
    res.json({ token, user: { email, name, orgId, role: 'admin' } });
  } catch (err) { console.error('Register error:', err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid input: valid email and password required' });
    }
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ email: user.email, orgId: user.orgId, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, name: user.name, orgId: user.orgId, role: user.role } });
  } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'Server error' }); }
});

router.get('/me', auth, (req: AuthRequest, res: Response) => {
  const user = users.find(u => u.email === req.user?.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ email: user.email, name: user.name, orgId: user.orgId, role: user.role });
});

export { router as authRouter };
