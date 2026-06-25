import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { email: string; orgId?: string; role?: string };
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your-secret-key') {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = typeof decoded === 'string' ? { email: decoded } : decoded as { email: string; orgId?: string; role?: string };
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

export const requireRole = (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.role || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};
