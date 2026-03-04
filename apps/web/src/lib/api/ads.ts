import type { AdRow } from '@/lib/mock-ads';

export interface AuthOptions {
  accessToken?: string | null;
}

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(window.location.origin);
    if (isLocal) return 'http://localhost:4000';
    return '';
  }
  return 'http://localhost:4000';
}

function headersWithAuth(json: boolean, accessToken?: string | null): HeadersInit {
  const h: Record<string, string> = {};
  if (json) h['Content-Type'] = 'application/json';
  if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
  return h;
}

export interface FetchAdsParams {
  fechaInicio?: string;
  fechaFin?: string;
  accountId?: string;
}

export async function fetchAds(
  params: FetchAdsParams = {},
  options?: AuthOptions
): Promise<AdRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'API no configurada. En Vercel (proyecto web) añade NEXT_PUBLIC_API_URL con la URL de tu API y redepliega.'
    );
  }
  const search = new URLSearchParams();
  if (params.fechaInicio) search.set('fechaInicio', params.fechaInicio);
  if (params.fechaFin) search.set('fechaFin', params.fechaFin);
  if (params.accountId) search.set('accountId', params.accountId);
  const url = `${base}/api/ads${search.toString() ? `?${search}` : ''}`;
  const res = await fetch(url, { headers: headersWithAuth(false, options?.accessToken) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json();
}

export interface AccountItem {
  account_id: string;
  account_name: string;
}

export async function fetchAccounts(options?: AuthOptions): Promise<AccountItem[]> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'API no configurada. En Vercel (proyecto web) añade la variable NEXT_PUBLIC_API_URL con la URL de tu API y redepliega.'
    );
  }
  const res = await fetch(`${base}/api/ads/accounts`, {
    headers: headersWithAuth(false, options?.accessToken),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? res.statusText);
  return body as AccountItem[];
}

export interface KommoLeadRow {
  lead_id: number;
  ad_id: string;
  nombre_lead: string;
  estado_actual: string;
  ultimo_estado_valido: string;
  razon_perdida: string;
  created_at_utc: string;
}

export interface FetchKommoLeadsParams {
  fechaInicio: string;
  fechaFin: string;
}

export async function fetchKommoLeads(
  params: FetchKommoLeadsParams,
  options?: AuthOptions
): Promise<KommoLeadRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'API no configurada. En Vercel (proyecto web) añade NEXT_PUBLIC_API_URL con la URL de tu API y redepliega.'
    );
  }
  const search = new URLSearchParams();
  search.set('fechaInicio', params.fechaInicio);
  search.set('fechaFin', params.fechaFin);
  const url = `${base}/api/sdr?${search}`;
  const res = await fetch(url, {
    headers: headersWithAuth(false, options?.accessToken),
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json();
}
