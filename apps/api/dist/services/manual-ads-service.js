import { supabaseLeads } from '../lib/supabase-leads.js';
export async function insertManualAd(params) {
    const { error } = await supabaseLeads.rpc('insertar_anuncio_manual', {
        p_ad_id: params.adId,
        p_ad_name: params.adName,
        p_audience: params.audience,
        p_ctr: params.ctr,
        p_cpm: params.cpm,
        p_total_leads: params.totalLeads,
        p_cost_per_lead: params.costPerLead,
        p_total_investment: params.totalInvestment,
    });
    if (error) {
        throw new Error(error.message);
    }
}
export async function getManualAd(adId) {
    const { data, error } = await supabaseLeads.rpc('consultar_anuncio_manual', {
        p_ad_id: adId,
    });
    if (error) {
        throw new Error(error.message);
    }
    const rows = (data ?? []);
    return rows[0] ?? null;
}
export async function listManualAds() {
    // #region agent log
    fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1b185d' }, body: JSON.stringify({ sessionId: '1b185d', location: 'manual-ads-service.ts:listManualAds:entry', message: 'listManualAds called (RPC)', data: {}, timestamp: Date.now(), hypothesisId: 'H3' }) }).catch(() => { });
    // #endregion
    // consultar_anuncio_manual() sin parámetros devuelve SETOF manual_ads_data (SECURITY DEFINER, bypasea RLS).
    const { data, error } = await supabaseLeads.rpc('consultar_anuncio_manual');
    // #region agent log
    fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1b185d' }, body: JSON.stringify({ sessionId: '1b185d', location: 'manual-ads-service.ts:listManualAds:afterSupabase', message: 'Supabase response', data: { dataLength: Array.isArray(data) ? data.length : -1, hasError: !!error, errorMessage: error?.message ?? null, errorCode: error?.code ?? null }, timestamp: Date.now(), hypothesisId: 'H1,H2,H3,H4,H5' }) }).catch(() => { });
    // #endregion
    if (error) {
        throw new Error(error.message);
    }
    const result = (data ?? []);
    // #region agent log
    fetch('http://127.0.0.1:7290/ingest/b2c4cb70-d50c-4374-bc86-0b8f1906e582', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1b185d' }, body: JSON.stringify({ sessionId: '1b185d', location: 'manual-ads-service.ts:listManualAds:return', message: 'listManualAds returning', data: { resultLength: result.length }, timestamp: Date.now(), hypothesisId: 'H3', runId: 'post-fix' }) }).catch(() => { });
    // #endregion
    return result;
}
export async function updateManualAdSdr(adId, params) {
    const { error } = await supabaseLeads.rpc('actualizar_datos_sdr', {
        p_ad_id: adId,
        p_qualified_leads: params.qualifiedLeads,
        p_sdr_notes: params.sdrNotes,
    });
    if (error) {
        throw new Error(error.message);
    }
}
export async function updateManualAdFull(adId, params) {
    const { error } = await supabaseLeads.rpc('actualizar_anuncio_completo', {
        p_ad_id: adId,
        p_ad_name: params.adName,
        p_audience: params.audience,
        p_ctr: params.ctr,
        p_cpm: params.cpm,
        p_total_leads: params.totalLeads,
        p_cost_per_lead: params.costPerLead,
        p_total_investment: params.totalInvestment,
        p_qualified_leads: params.qualifiedLeads,
        p_sdr_notes: params.sdrNotes,
    });
    if (error) {
        throw new Error(error.message);
    }
}
