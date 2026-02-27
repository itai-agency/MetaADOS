import { supabaseAds } from '../lib/supabase-ads.js';
import { supabaseLeads } from '../lib/supabase-leads.js';
import type { ReporteAdosRow } from '../types/rpc.js';
import type { AdRowResponse } from '../types/rpc.js';

export interface AdsQueryParams {
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;
  accountId: string;
}

/**
 * Cuenta leads calificados por ad_id (todos los que devuelve obtener_leads_ados son calificados).
 */
function countCalificadosByAdId(leads: { ad_id: string }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of leads) {
    const id = String(row.ad_id);
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

/**
 * Extrae el indicador de audiencia (DDO, ADV) del nombre del anuncio.
 * Por ahora solo ddo y adv; se puede ampliar con más patrones.
 */
function extractAudienceFromAdName(adName: string): string {
  if (!adName || typeof adName !== 'string') return '';
  const lower = adName.toLowerCase();
  if (lower.includes('ddo')) return 'DDO';
  if (lower.includes('adv')) return 'ADV';
  if (lower.includes('lookalike')) return 'LOOKALIKE';
  return '';
}

/**
 * Puntaje simple según tasa de calificación y CTR (CTR viene de Meta).
 * Ajustar reglas según negocio.
 */
function computePuntaje(tasaCali: number, ctr: number): number {
  if (tasaCali === 0) return Math.min(30, Math.round(ctr * 50));
  if (tasaCali >= 100) return 70;
  if (tasaCali >= 60) return 50;
  return 30;
}

export async function getAdsReport(params: AdsQueryParams): Promise<AdRowResponse[]> {
  const { fechaInicio, fechaFin, accountId } = params;

  const [reportResult, leadsResult] = await Promise.all([
    supabaseAds.rpc('reporte_ados', {
      p_fecha_inicio: fechaInicio,
      p_fecha_fin: fechaFin,
      p_account_id: accountId,
    }),
    supabaseLeads.rpc('obtener_leads_ados', {
      p_fecha_inicio: fechaInicio,
      p_fecha_fin: fechaFin,
    }),
  ]);

  if (reportResult.error) {
    throw new Error(`reporte_ados: ${reportResult.error.message}`);
  }
  if (leadsResult.error) {
    throw new Error(`obtener_leads_ados: ${leadsResult.error.message}`);
  }

  const reportRows = (reportResult.data ?? []) as ReporteAdosRow[];
  const leadsRows = (leadsResult.data ?? []) as { ad_id: string }[];

  const calificadosByAdId = countCalificadosByAdId(leadsRows);
  const adIdsWithLeads = new Set(leadsRows.map((r) => String(r.ad_id)));

  const out: AdRowResponse[] = reportRows.map((row) => {
    const metaId = String(row.meta_id);
    const inversion = Number(row.inversion) ?? 0;
    const leads = Number(row.leads_meta) ?? 0;
    const calificados = calificadosByAdId.get(metaId) ?? 0;
    const tasaCali = leads > 0 ? Math.round((calificados / leads) * 100) : 0;
    const costoLc = calificados > 0 ? Number((inversion / calificados).toFixed(2)) : null;
    const puntaje = computePuntaje(tasaCali, row.ctr ?? 0);
    const costoLead = leads > 0 ? Number((inversion / leads).toFixed(2)) : (Number(row.costo_lead_me) || 0);

    const anuncio = row.anuncio ?? '';
    const audienciaExtraida = extractAudienceFromAdName(anuncio);
    const audiencia = audienciaExtraida || (row.audiencia ?? '');

    return {
      metaId,
      anuncio,
      audiencia,
      ctr: Number(row.ctr) ?? 0,
      cpm: Number(row.cpm) ?? 0,
      leads,
      costoLead,
      inversion,
      calificados,
      tasaCali,
      costoLc,
      puntaje,
      hasSdr: adIdsWithLeads.has(metaId),
    };
  });

  return out;
}
