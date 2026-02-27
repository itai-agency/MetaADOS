import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/database-types';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

/** Cliente Supabase en el servidor (RSC, Route Handlers) con cookies para sesión. Local vs Vercel según VERCEL env. */
export async function createServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan variables de Supabase. En local: NEXT_PUBLIC_SUPABASE_URL_LOCAL y NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL (o sin _LOCAL). En Vercel: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createSupabaseServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
