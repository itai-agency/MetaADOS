import { supabaseLeads } from '../lib/supabase-leads.js';
import type { KommoLeadsAdosRow } from '../types/rpc.js';

export interface KommoLeadsParams {
  fechaInicio: string;
  fechaFin: string;
}

/** Asegura formato YYYY-MM-DD para la RPC (evita timezone/hora) */
function toDateOnly(s: string): string {
  const trimmed = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return trimmed.slice(0, 10);
}

export async function getKommoLeadsAdos(params: KommoLeadsParams): Promise<KommoLeadsAdosRow[]> {
  const fechaInicio = toDateOnly(params.fechaInicio);
  const fechaFin = toDateOnly(params.fechaFin);

  console.log('[kommo_leads_ados] calling RPC with', { p_fecha_inicio: fechaInicio, p_fecha_fin: fechaFin });

  const { data, error } = await supabaseLeads.rpc('kommo_leads_ados', {
    p_fecha_inicio: fechaInicio,
    p_fecha_fin: fechaFin,
  });

  if (error) {
    console.error('[kommo_leads_ados] Supabase error:', error);
    throw new Error(`kommo_leads_ados: ${error.message}`);
  }

  const rows = (data ?? []) as KommoLeadsAdosRow[];
  console.log('[kommo_leads_ados] Supabase returned', rows.length, 'rows');
  return rows;
}
