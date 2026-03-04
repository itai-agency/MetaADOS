import { supabaseLeads } from '../lib/supabase-leads.js';
export async function getKommoLeadsAdos(params) {
    const { fechaInicio, fechaFin } = params;
    const { data, error } = await supabaseLeads.rpc('kommo_leads_ados', {
        p_fecha_inicio: fechaInicio,
        p_fecha_fin: fechaFin,
    });
    if (error) {
        throw new Error(`kommo_leads_ados: ${error.message}`);
    }
    return (data ?? []);
}
