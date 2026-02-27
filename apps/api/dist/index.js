import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { adsRouter } from './routes/ads.js';
import { PORT } from './config/env.js';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/ads', adsRouter);
app.listen(Number(PORT), () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
