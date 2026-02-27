import { supabaseAds } from '../lib/supabase-ads.js';

export interface AccountItem {
  account_id: string;
  account_name: string;
}

export async function getAccountsList(): Promise<AccountItem[]> {
  const { data, error } = await supabaseAds.rpc('obtener_lista_cuentas_ads');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AccountItem[];
}
