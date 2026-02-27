/**
 * Configuración de Supabase según entorno: local vs Vercel (producción).
 * - Local: NEXT_PUBLIC_SUPABASE_URL_LOCAL y NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL (o las sin sufijo si no existen).
 * - Vercel: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (Vercel setea VERCEL=1).
 */

function isLocalEnv(): boolean {
  if (typeof window !== 'undefined') {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(window.location.origin);
  }
  return process.env.VERCEL !== '1';
}

export function getSupabaseUrl(): string | null {
  const isLocal = isLocalEnv();
  const urlLocal = process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL?.trim();
  const urlProd = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (isLocal && urlLocal) return urlLocal;
  if (urlProd) return urlProd;
  if (urlLocal) return urlLocal;
  return null;
}

export function getSupabaseAnonKey(): string | null {
  const isLocal = isLocalEnv();
  const keyLocal = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL?.trim();
  const keyProd = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (isLocal && keyLocal) return keyLocal;
  if (keyProd) return keyProd;
  if (keyLocal) return keyLocal;
  return null;
}
