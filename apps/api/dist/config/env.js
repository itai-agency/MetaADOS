/**
 * Variables de entorno para la API.
 * Copiar .env.example a .env y completar los valores.
 */
function getEnv(key) {
    const value = process.env[key];
    if (value == null || value === '') {
        throw new Error(`Missing required env: ${key}`);
    }
    return value;
}
function getEnvOptional(key) {
    return process.env[key];
}
/** Base de datos de anuncios (reporte_ados) */
export const ADS_SUPABASE_URL = getEnv('SUPABASE_ADS_URL');
export const ADS_SUPABASE_SERVICE_KEY = getEnv('SUPABASE_ADS_SERVICE_ROLE_KEY');
/** Base de datos de leads (obtener_leads_ados) */
export const LEADS_SUPABASE_URL = getEnv('SUPABASE_LEADS_URL');
export const LEADS_SUPABASE_SERVICE_KEY = getEnv('SUPABASE_LEADS_SERVICE_ROLE_KEY');
export const PORT = getEnvOptional('PORT') ?? '4000';
