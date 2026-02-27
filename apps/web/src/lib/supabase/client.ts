'use client';

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database-types';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

/** Cliente Supabase en el navegador (Auth, sesión). Proyecto SDR/Leads. Usa vars locales o de Vercel según el origen. */
export function createBrowserClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan variables de Supabase. En local usa NEXT_PUBLIC_SUPABASE_URL_LOCAL y NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL (o las sin _LOCAL). En Vercel: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createSupabaseBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
