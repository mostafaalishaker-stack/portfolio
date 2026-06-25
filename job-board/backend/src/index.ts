import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';

const app = express();
const PORT = process.env.PORT || 5003;

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://mostafaali.dev'] : '*',
}));
app.use(express.json());

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Job Board API running on port ${PORT}`);
});
