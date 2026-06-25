import { Router, Request, Response } from 'express';
import { authMiddleware, employerMiddleware } from './auth.js';

function sanitize(str: string): string {
  return str.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' }[c] || c));
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  salary: string;
  description: string;
  requirements: string[];
  postedBy: number;
  createdAt: string;
}

// In-memory job store (resets on server restart — no database required)
const jobs: Job[] = [];
let nextId = 1;

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  let result = [...jobs];
  const { search, type, location } = req.query;
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    result = result.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.description.toLowerCase().includes(s));
  }
  if (type && typeof type === 'string') {
    result = result.filter(j => j.type === type);
  }
  if (location && typeof location === 'string') {
    result = result.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
  }
  res.json(result);
});

router.get('/:id', (req: Request, res: Response): void => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
});

router.post('/', authMiddleware, employerMiddleware, (req: Request, res: Response): void => {
  const { title, company, location, type, salary, description, requirements } = req.body;
  if (!title || !company || !location || !type || !salary || !description) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  if (!['remote', 'onsite', 'hybrid'].includes(type)) {
    res.status(400).json({ error: 'Type must be remote, onsite, or hybrid' });
    return;
  }
  const job: Job = {
    id: nextId++,
    title: sanitize(title),
    company: sanitize(company),
    location: sanitize(location),
    type,
    salary: sanitize(salary),
    description: sanitize(description),
    requirements: (requirements || []).map((r: string) => sanitize(r)),
    postedBy: req.user!.id,
    createdAt: new Date().toISOString(),
  };
  jobs.push(job);
  res.status(201).json(job);
});

router.put('/:id', authMiddleware, employerMiddleware, (req: Request, res: Response): void => {
  const idx = jobs.findIndex(j => j.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (jobs[idx].postedBy !== req.user!.id) {
    res.status(403).json({ error: 'Not your job listing' });
    return;
  }
  const { title, company, location, type, salary, description, requirements } = req.body;
  if (title) jobs[idx].title = sanitize(title);
  if (company) jobs[idx].company = sanitize(company);
  if (location) jobs[idx].location = sanitize(location);
  if (type && ['remote', 'onsite', 'hybrid'].includes(type)) jobs[idx].type = type;
  if (salary) jobs[idx].salary = sanitize(salary);
  if (description) jobs[idx].description = sanitize(description);
  if (requirements) jobs[idx].requirements = (requirements as string[]).map((r: string) => sanitize(r));
  res.json(jobs[idx]);
});

router.delete('/:id', authMiddleware, employerMiddleware, (req: Request, res: Response): void => {
  const idx = jobs.findIndex(j => j.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (jobs[idx].postedBy !== req.user!.id) {
    res.status(403).json({ error: 'Not your job listing' });
    return;
  }
  jobs.splice(idx, 1);
  res.json({ message: 'Job deleted' });
});

export default router;
