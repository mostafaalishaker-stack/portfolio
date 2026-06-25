import { Router, Response } from 'express';
import { AuthRequest, auth } from '../middleware/auth.js';

const router = Router();
/**
 * In-memory subscription storage — for demo/portfolio purposes only.
 * Replace with a database (e.g. PostgreSQL via Prisma) in production.
 */
let stripe: any = null;
const getStripe = () => {
  if (!stripe) {
    const Stripe = require('stripe');
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === 'sk_test_your_key') {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripe = new Stripe(key, { apiVersion: '2024-11-20.acacia' });
  }
  return stripe;
};
const subscriptions: Record<string, { plan: string; status: string; currentPeriodEnd: number }> = {};

const PLANS = [
  { id: 'free', name: 'Free', price: 0, features: ['Up to 3 users', 'Basic analytics', '1 project'] },
  { id: 'starter', name: 'Starter', price: 29, features: ['Up to 10 users', 'Advanced analytics', '10 projects', 'Email support'], priceId: 'price_starter' },
  { id: 'pro', name: 'Professional', price: 99, features: ['Unlimited users', 'All analytics', 'Unlimited projects', 'Priority support', 'API access'], priceId: 'price_pro' },
  { id: 'enterprise', name: 'Enterprise', price: 299, features: ['Everything in Pro', 'SSO', 'Custom integrations', 'SLA', 'Dedicated support'], priceId: 'price_enterprise' },
];

router.get('/plans', (_req, res: Response) => res.json(PLANS));

const getOrgId = (req: AuthRequest): string => {
  if (!req.user?.orgId) throw new Error('User orgId not found');
  return req.user.orgId;
};

router.get('/subscription', auth, (req: AuthRequest, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const sub = subscriptions[orgId] || { plan: 'free', status: 'active', currentPeriodEnd: Date.now() + 30 * 86400000 };
    res.json(sub);
  } catch (err) { console.error('GET /billing/subscription error:', err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/subscribe', auth, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { planId } = req.body;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });
    if (plan.price === 0) {
      subscriptions[orgId] = { plan: 'free', status: 'active', currentPeriodEnd: Date.now() + 30 * 86400000 };
      return res.json(subscriptions[orgId]);
    }
    // In production: create Stripe checkout session
    subscriptions[orgId] = { plan: planId, status: 'active', currentPeriodEnd: Date.now() + 30 * 86400000 };
    res.json({ ...subscriptions[orgId], checkoutUrl: `https://checkout.stripe.com/session_${planId}` });
  } catch (err) { console.error('POST /billing/subscribe error:', err); res.status(500).json({ error: 'Subscription failed' }); }
});

export { router as billingRouter };
