import { Router, Request, Response } from 'express';
import { authMiddleware, candidateMiddleware, employerMiddleware } from './auth.js';

function sanitize(str: string): string {
  return str.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' }[c] || c));
}

interface Application {
  id: number;
  jobId: number;
  userId: number;
  userName: string;
  userEmail: string;
  coverLetter: string;
  appliedAt: string;
}

// In-memory application store (resets on server restart — no database required)
const applications: Application[] = [];
let nextId = 1;

const router = Router();

router.post('/:jobId/apply', authMiddleware, candidateMiddleware, (req: Request, res: Response): void => {
  const jobId = parseInt(req.params.jobId);
  const { coverLetter } = req.body;
  const user = req.user!;
  const existing = applications.find(a => a.jobId === jobId && a.userId === user.id);
  if (existing) {
    res.status(409).json({ error: 'Already applied to this job' });
    return;
  }
  const app: Application = {
    id: nextId++,
    jobId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    coverLetter: sanitize(coverLetter || ''),
    appliedAt: new Date().toISOString(),
  };
  applications.push(app);
  res.status(201).json(app);
});

router.get('/:jobId', authMiddleware, employerMiddleware, (req: Request, res: Response): void => {
  const jobId = parseInt(req.params.jobId);
  const apps = applications.filter(a => a.jobId === jobId);
  res.json(apps);
});

export default router;
