/** Fila devuelta por reporte_ados */
export interface ReporteAdosRow {
    meta_id: string;
    anuncio: string;
    audiencia: string;
    ctr: number;
    cpm: number;
    leads_meta: number;
    costo_lead_me: number;
    inversion: number;
}
/** Fila devuelta por obtener_leads_ados (solo usamos ad_id para contar) */
export interface LeadAdosRow {
    lead_id: number;
    ad_id: string;
    created_at_utc?: string;
    pipeline_id?: string;
    estado_actual?: string;
}
/** Fila que devuelve la API al front (maqueta) */
export interface AdRowResponse {
    metaId: string;
    anuncio: string;
    audiencia: string;
    ctr: number;
    cpm: number;
    leads: number;
    costoLead: number;
    inversion: number;
    calificados: number;
    tasaCali: number;
    costoLc: number | null;
    puntaje: number;
    hasSdr: boolean;
}
//# sourceMappingURL=rpc.d.ts.map