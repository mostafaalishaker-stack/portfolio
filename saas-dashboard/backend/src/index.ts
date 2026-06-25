import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { orgRouter } from './routes/organizations.js';
import { billingRouter } from './routes/billing.js';
import { dashboardRouter } from './routes/dashboard.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/orgs', orgRouter);
app.use('/api/billing', billingRouter);
app.use('/api/dashboard', dashboardRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`SaaS API running on port ${PORT}`));
