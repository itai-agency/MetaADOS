import { Router } from 'express';
import { getAccountsList } from '../services/accounts-service.js';
import { getAdsReport } from '../services/ads-service.js';
import { getManualAd, insertManualAd, listManualAds, updateManualAdFull, updateManualAdSdr } from '../services/manual-ads-service.js';
import { z } from 'zod';
const DEFAULT_ACCOUNT_ID = '1584938395981836';
function startOfCurrentMonth() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
}
function endOfCurrentMonth() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const last = new Date(y, m, 0);
    const d = String(last.getDate()).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${y}-${mm}-${d}`;
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
export const adsRouter = Router();
const manualAdBodySchema = z.object({
    adId: z.string().min(1, 'META ID es requerido'),
    adName: z.string().min(1, 'Nombre del anuncio es requerido'),
    audience: z.string().min(1, 'Audiencia es requerida'),
    ctr: z.number().min(0),
    cpm: z.number().min(0),
    totalLeads: z.number().int().min(0),
    costPerLead: z.number().min(0),
    totalInvestment: z.number().min(0),
});
adsRouter.get('/', async (req, res) => {
    try {
        const parsed = querySchema.safeParse(req.query);
        if (!parsed.success) {
            const msg = parsed.error.flatten().fieldErrors;
            return res.status(400).json({ error: 'Invalid query', details: msg });
        }
        const rows = await getAdsReport(parsed.data);
        return res.json(rows);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
});
adsRouter.get('/accounts', async (_req, res) => {
    try {
        const accounts = await getAccountsList();
        return res.json(accounts);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
});
adsRouter.get('/manual', async (_req, res) => {
    // #region agent log
    fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1b185d' }, body: JSON.stringify({ sessionId: '1b185d', location: 'ads.ts:GET /manual:entry', message: 'GET /manual hit', data: {}, timestamp: Date.now(), hypothesisId: 'H3' }) }).catch(() => { });
    // #endregion
    try {
        const rows = await listManualAds();
        // #region agent log
        fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1b185d' }, body: JSON.stringify({ sessionId: '1b185d', location: 'ads.ts:GET /manual:beforeJson', message: 'Sending response', data: { rowsLength: rows.length }, timestamp: Date.now(), hypothesisId: 'H3' }) }).catch(() => { });
        // #endregion
        return res.json(rows);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
});
adsRouter.get('/manual/:adId', async (req, res) => {
    try {
        const { adId } = req.params;
        const row = await getManualAd(adId);
        if (!row)
            return res.status(404).json({ error: 'Anuncio no encontrado' });
        return res.json(row);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
});
adsRouter.post('/manual', async (req, res) => {
    try {
        const parsed = manualAdBodySchema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.flatten().fieldErrors;
            return res.status(400).json({ error: 'Datos inválidos', details: msg });
        }
        await insertManualAd(parsed.data);
        return res.status(201).json({ success: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
});
const updateManualSdrSchema = z.object({
    qualifiedLeads: z.number().int().min(0),
    sdrNotes: z.string(),
});
adsRouter.patch('/manual/:adId', async (req, res) => {
    try {
        const { adId } = req.params;
        const parsed = updateManualSdrSchema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.flatten().fieldErrors;
            return res.status(400).json({ error: 'Datos inválidos', details: msg });
        }
        await updateManualAdSdr(adId, parsed.data);
        return res.json({ success: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
});
const updateManualFullSchema = z.object({
    adName: z.string().min(1),
    audience: z.string().min(1),
    ctr: z.number().min(0),
    cpm: z.number().min(0),
    totalLeads: z.number().int().min(0),
    costPerLead: z.number().min(0),
    totalInvestment: z.number().min(0),
    qualifiedLeads: z.number().int().min(0),
    sdrNotes: z.string(),
});
adsRouter.put('/manual/:adId', async (req, res) => {
    try {
        const { adId } = req.params;
        const parsed = updateManualFullSchema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.flatten().fieldErrors;
            return res.status(400).json({ error: 'Datos inválidos', details: msg });
        }
        await updateManualAdFull(adId, parsed.data);
        return res.json({ success: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
});
