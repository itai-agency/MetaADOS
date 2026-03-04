import { Router } from 'express';
import { getAccountsList } from '../services/accounts-service.js';
import { getAdsReport } from '../services/ads-service.js';
import { getKommoLeadsAdos } from '../services/kommo-leads-service.js';
import { z } from 'zod';

const DEFAULT_ACCOUNT_ID = '1584938395981836';

function startOfCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

function endOfCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const last = new Date(y, m, 0);
  const d = String(last.getDate()).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${y}-${mm}-${d}`;
}

function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const querySchema = z.object({
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  accountId: z.string().min(1).optional(),
}).transform((data) => ({
  fechaInicio: data.fechaInicio ?? startOfCurrentMonth(),
  fechaFin: data.fechaFin ?? endOfCurrentMonth(),
  accountId: data.accountId ?? DEFAULT_ACCOUNT_ID,
}));

const sdrQuerySchema = z.object({
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).transform((data) => ({
  fechaInicio: data.fechaInicio ?? startOfCurrentMonth(),
  fechaFin: data.fechaFin ?? todayString(),
}));

export const adsRouter = Router();

adsRouter.get('/', async (req, res) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      return res.status(400).json({ error: 'Invalid query', details: msg });
    }

    const rows = await getAdsReport(parsed.data);
    return res.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

adsRouter.get('/accounts', async (req, res) => {
  try {
    const accounts = await getAccountsList();
    return res.json(accounts);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

adsRouter.get('/sdr', async (req, res) => {
  try {
    const parsed = sdrQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      return res.status(400).json({ error: 'Invalid query', details: msg });
    }
    console.log('[SDR] query params received:', req.query, '-> parsed:', parsed.data);

    const rows = await getKommoLeadsAdos(parsed.data);
    console.log('[SDR] rows returned:', rows.length, 'dates:', parsed.data.fechaInicio, '-', parsed.data.fechaFin);
    return res.json(rows);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});
