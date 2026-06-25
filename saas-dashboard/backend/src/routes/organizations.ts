import { Router, Response } from 'express';
import { AuthRequest, auth, requireRole } from '../middleware/auth.js';

const router = Router();
/**
 * In-memory organization storage — for demo/portfolio purposes only.
 * Replace with a database (e.g. PostgreSQL via Prisma) in production.
 */
const orgs: Record<string, { name: string; plan: string; members: { email: string; role: string }[]; stats: { users: number; revenue: number; growth: number } }> = {};

const getOrgId = (req: AuthRequest): string => {
  if (!req.user?.orgId) throw new Error('User orgId not found');
  return req.user.orgId;
};

const getUserEmail = (req: AuthRequest): string => {
  if (!req.user?.email) throw new Error('User email not found');
  return req.user.email;
};

router.get('/', auth, (req: AuthRequest, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const org = orgs[orgId];
    if (!org) return res.json({ name: 'My Organization', plan: 'free', members: [{ email: getUserEmail(req), role: 'admin' }], stats: { users: 1, revenue: 0, growth: 0 } });
    res.json(org);
  } catch (err) { console.error('GET /orgs error:', err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/', auth, (req: AuthRequest, res: Response) => {
  try {
    const orgId = getOrgId(req);
    if (!orgs[orgId]) orgs[orgId] = { name: '', plan: 'free', members: [{ email: getUserEmail(req), role: 'admin' }], stats: { users: 1, revenue: 0, growth: 0 } };
    orgs[orgId].name = req.body.name || orgs[orgId].name;
    res.json(orgs[orgId]);
  } catch (err) { console.error('PUT /orgs error:', err); res.status(500).json({ error: 'Server error' }); }
});

router.get('/members', auth, (req: AuthRequest, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const org = orgs[orgId];
    res.json(org?.members || [{ email: getUserEmail(req), role: 'admin' }]);
  } catch (err) { console.error('GET /orgs/members error:', err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/members', auth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  try {
    const orgId = getOrgId(req);
    if (!orgs[orgId]) return res.status(404).json({ error: 'Org not found' });
    orgs[orgId].members.push({ email: req.body.email, role: req.body.role || 'member' });
    res.json(orgs[orgId].members);
  } catch (err) { console.error('POST /orgs/members error:', err); res.status(500).json({ error: 'Server error' }); }
});

export { router as orgRouter };
