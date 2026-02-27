-- Actualiza todos los campos de un anuncio manual (edición completa desde SDR).
-- Ejecutar en el proyecto Supabase de SDR/Leads donde está manual_ads_data.
CREATE OR REPLACE FUNCTION public.actualizar_anuncio_completo(
    p_ad_id text,
    p_ad_name varchar,
    p_audience varchar,
    p_ctr numeric,
    p_cpm numeric,
    p_total_leads numeric,
    p_cost_per_lead numeric,
    p_total_investment numeric,
    p_qualified_leads numeric,
    p_sdr_notes text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.manual_ads_data
    SET 
        ad_name = p_ad_name,
        audience = p_audience,
        ctr = p_ctr,
        cpm = p_cpm,
        total_leads = p_total_leads,
        cost_per_lead = p_cost_per_lead,
        total_investment = p_total_investment,
        qualified_leads = p_qualified_leads,
        sdr_notes = p_sdr_notes,
        updated_at = now()
    WHERE ad_id = p_ad_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Error: El anuncio con Meta ID % no existe.', p_ad_id;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.actualizar_anuncio_completo(text, varchar, varchar, numeric, numeric, numeric, numeric, numeric, numeric, text) TO authenticated, service_role;
