-- Actualiza leads calificados y notas SDR para un anuncio manual.
-- Ejecutar en el proyecto Supabase de SDR/Leads donde está manual_ads_data.
CREATE OR REPLACE FUNCTION public.actualizar_datos_sdr(
    p_ad_id text,
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
        qualified_leads = p_qualified_leads,
        sdr_notes = p_sdr_notes,
        updated_at = now()
    WHERE ad_id = p_ad_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El Meta ID % no existe en la base de datos.', p_ad_id;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.actualizar_datos_sdr(text, numeric, text) TO authenticated, service_role;
