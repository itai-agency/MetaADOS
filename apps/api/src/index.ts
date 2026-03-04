import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { requireAuth } from './middleware/auth.js';
import { adsRouter } from './routes/ads.js';
import { getKommoLeadsAdos } from './services/kommo-leads-service.js';
import { PORT } from './config/env.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

function startOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}
function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function sdrHandler(req: express.Request, res: express.Response): Promise<void> {
  try {
    const q = req.query as Record<string, string | undefined>;
    const fechaInicio = q.fechaInicio ?? q.fechalnicio ?? startOfMonth();
    const fechaFin = q.fechaFin ?? today();
    const rows = await getKommoLeadsAdos({ fechaInicio, fechaFin });
    res.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}

// Ruta SDR en dos paths: /api/sdr (prioritaria) y /api/ads/sdr (compatibilidad)
app.get('/api/sdr', requireAuth, (req, res) => {
  void sdrHandler(req, res);
});
app.get('/api/ads/sdr', requireAuth, (req, res) => {
  void sdrHandler(req, res);
});

app.use('/api/ads', requireAuth, adsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(Number(PORT), () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
