import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { authRouter } from './routes/auth.js';
import { orgRouter } from './routes/organizations.js';
import { billingRouter } from './routes/billing.js';
import { dashboardRouter } from './routes/dashboard.js';

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/orgs', orgRouter);
app.use('/api/billing', billingRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`SaaS API running on port ${PORT}`));
