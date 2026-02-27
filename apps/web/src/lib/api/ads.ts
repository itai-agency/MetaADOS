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

export interface InsertManualAdPayload {
  adId: string;
  adName: string;
  audience: string;
  ctr: number;
  cpm: number;
  totalLeads: number;
  costPerLead: number;
  totalInvestment: number;
}

export async function insertManualAd(
  payload: InsertManualAdPayload,
  options?: AuthOptions
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/ads/manual`, {
    method: 'POST',
    headers: headersWithAuth(true, options?.accessToken),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
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

export interface ManualAdRow {
  ad_id: string;
  ad_name: string;
  audience: string;
  ctr: number;
  cpm: number;
  total_leads: number;
  cost_per_lead: number;
  total_investment: number;
  qualified_leads?: number | null;
  sdr_notes?: string | null;
  updated_at?: string | null;
}

export async function fetchManualAds(options?: AuthOptions): Promise<ManualAdRow[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/ads/manual`, {
    headers: headersWithAuth(false, options?.accessToken),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? res.statusText);
  return body as ManualAdRow[];
}

export async function fetchManualAd(
  adId: string,
  options?: AuthOptions
): Promise<ManualAdRow | null> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/ads/manual/${encodeURIComponent(adId)}`, {
    headers: headersWithAuth(false, options?.accessToken),
  });
  if (res.status === 404) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? res.statusText);
  return body as ManualAdRow;
}

export async function updateManualAdSdr(
  adId: string,
  payload: { qualifiedLeads: number; sdrNotes: string },
  options?: AuthOptions
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/ads/manual/${encodeURIComponent(adId)}`, {
    method: 'PATCH',
    headers: headersWithAuth(true, options?.accessToken),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? res.statusText);
}

export interface UpdateManualAdFullPayload {
  adName: string;
  audience: string;
  ctr: number;
  cpm: number;
  totalLeads: number;
  costPerLead: number;
  totalInvestment: number;
  qualifiedLeads: number;
  sdrNotes: string;
}

export async function updateManualAdFull(
  adId: string,
  payload: UpdateManualAdFullPayload,
  options?: AuthOptions
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/ads/manual/${encodeURIComponent(adId)}`, {
    method: 'PUT',
    headers: headersWithAuth(true, options?.accessToken),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? res.statusText);
}
