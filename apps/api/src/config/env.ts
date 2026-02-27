/**
 * Variables de entorno para la API.
 * Copiar .env.example a .env y completar los valores.
 */

function getEnv(key: string): string {
  const value = process.env[key];
  if (value == null || value === '') {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}

/** Base de datos de anuncios (reporte_ados) */
export const ADS_SUPABASE_URL = getEnv('SUPABASE_ADS_URL');
export const ADS_SUPABASE_SERVICE_KEY = getEnv('SUPABASE_ADS_SERVICE_ROLE_KEY');

/** Base de datos de leads / SDR (Auth y manual_ads_data) */
export const LEADS_SUPABASE_URL = getEnv('SUPABASE_LEADS_URL');
export const LEADS_SUPABASE_SERVICE_KEY = getEnv('SUPABASE_LEADS_SERVICE_ROLE_KEY');
/** JWT Secret del proyecto SDR/Leads para verificar tokens de Auth (Project Settings > API > JWT Secret) */
export const LEADS_SUPABASE_JWT_SECRET = getEnv('SUPABASE_LEADS_JWT_SECRET');

export const PORT = getEnvOptional('PORT') ?? '4000';
