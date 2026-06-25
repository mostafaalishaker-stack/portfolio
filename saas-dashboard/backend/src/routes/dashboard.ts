import { Router, Response } from 'express';
import { AuthRequest, auth } from '../middleware/auth.js';

const router = Router();

router.get('/stats', auth, (req: AuthRequest, res: Response) => {
  res.json({
    revenue: { current: 12450, previous: 10200, change: 22 },
    users: { current: 1240, previous: 980, change: 26.5 },
    activeProjects: { current: 48, previous: 35, change: 37 },
    conversionRate: { current: 3.2, previous: 2.8, change: 14.3 },
    revenueByMonth: [
      { month: 'Jan', revenue: 8200 }, { month: 'Feb', revenue: 9100 }, { month: 'Mar', revenue: 10200 },
      { month: 'Apr', revenue: 11100 }, { month: 'May', revenue: 11800 }, { month: 'Jun', revenue: 12450 },
    ],
    usersByPlan: [
      { plan: 'Free', count: 540 }, { plan: 'Starter', count: 320 }, { plan: 'Pro', count: 280 }, { plan: 'Enterprise', count: 100 },
    ],
    recentActivity: [
      { action: 'New user registered', time: '2 min ago', type: 'user' },
      { action: 'Subscription upgraded to Pro', time: '15 min ago', type: 'billing' },
      { action: 'New project created', time: '1 hour ago', type: 'project' },
      { action: 'Payment received - $99.00', time: '3 hours ago', type: 'payment' },
      { action: 'Team member invited', time: '5 hours ago', type: 'team' },
      { action: 'API key generated', time: '1 day ago', type: 'api' },
    ],
  });
});

export { router as dashboardRouter };
