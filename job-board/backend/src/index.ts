import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';

const app = express();
const PORT = process.env.PORT || 5003;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://mostafaali.dev'] : '*',
}));
app.use(express.json());

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Job Board API running on port ${PORT}`);
});
