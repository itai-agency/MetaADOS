import { supabaseAds } from '../lib/supabase-ads.js';
export async function getAccountsList() {
    const { data, error } = await supabaseAds.rpc('obtener_lista_cuentas_ads');
    if (error) {
        throw new Error(error.message);
    }
    return (data ?? []);
}
