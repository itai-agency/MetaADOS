'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TabNav } from '@/components/dashboard/TabNav';
import { ClientSelector } from '@/components/dashboard/ClientSelector';
import { SdrEntryView } from '@/components/dashboard/SdrEntryView';
import { ResultsTable } from '@/components/dashboard/ResultsTable';
import type { AdRow } from '@/lib/mock-ads';
import { fetchAds, fetchAccounts, fetchKommoLeads } from '@/lib/api/ads';
import type { AccountItem, KommoLeadRow } from '@/lib/api/ads';
import { useAuth } from '@/contexts/AuthContext';

/** Primer día del mes actual en YYYY-MM-DD */
function startOfCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

/** Fecha de hoy en YYYY-MM-DD */
function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function exportCsvAds(rows: AdRow[]) {
  const headers = ['META ID', 'ANUNCIO', 'AUDIENCIA', 'CTR', 'CPM', 'LEADS', 'COSTO/LEAD', 'INVERSIÓN', 'CALIFICADO', 'TASA CALI.', 'COSTO/LC', 'PUNTAJE'];
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.metaId,
        `"${r.anuncio}"`,
        r.audiencia,
        r.ctr,
        r.cpm,
        r.leads,
        r.costoLead,
        r.inversion,
        r.calificados,
        r.tasaCali,
        r.costoLc ?? '',
        r.puntaje,
      ].join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meta_ados_resultados.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsvSdr(rows: KommoLeadRow[]) {
  const headers = ['Lead ID', 'Ad ID', 'Nombre lead', 'Estado actual', 'Último estado válido', 'Razón pérdida', 'Created at (UTC)'];
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.lead_id,
        r.ad_id,
        `"${(r.nombre_lead ?? '').replace(/"/g, '""')}"`,
        `"${(r.estado_actual ?? '').replace(/"/g, '""')}"`,
        `"${(r.ultimo_estado_valido ?? '').replace(/"/g, '""')}"`,
        `"${(r.razon_perdida ?? '').replace(/"/g, '""')}"`,
        r.created_at_utc ?? '',
      ].join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kommo_leads_sdr.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const defaultFechaInicio = startOfCurrentMonth();
const defaultFechaFin = todayString();

export default function DashboardPage() {
  const router = useRouter();
  const { getAccessToken, user, signOut, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'gestor' | 'sdr'>('gestor');
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState(defaultFechaInicio);
  const [fechaFin, setFechaFin] = useState(defaultFechaFin);
  const [ads, setAds] = useState<AdRow[]>([]);
  const [sdrRows, setSdrRows] = useState<KommoLeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSdr, setLoadingSdr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSdr, setErrorSdr] = useState<string | null>(null);
  const [errorAccounts, setErrorAccounts] = useState<string | null>(null);

  useEffect(() => {
    setErrorAccounts(null);
    getAccessToken()
      .then((token) => fetchAccounts({ accessToken: token ?? undefined }))
      .then((list) => {
        setAccounts(list);
        if (list.length > 0 && !selectedAccountId) setSelectedAccountId(list[0].account_id);
      })
      .catch((err) => {
        setAccounts([]);
        const msg = err instanceof Error ? err.message : 'No se pudieron cargar los clientes.';
        setErrorAccounts(msg);
        console.error('[Dashboard] Error cargando clientes:', msg, err);
      });
  }, [getAccessToken]);

  useEffect(() => {
    if (!selectedAccountId) {
      setAds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getAccessToken()
      .then((token) =>
        fetchAds(
          { accountId: selectedAccountId, fechaInicio, fechaFin },
          { accessToken: token ?? undefined }
        )
      )
      .then(setAds)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar datos'))
      .finally(() => setLoading(false));
  }, [selectedAccountId, fechaInicio, fechaFin, getAccessToken]);

  useEffect(() => {
    if (activeTab !== 'sdr') return;
    setLoadingSdr(true);
    setErrorSdr(null);
    getAccessToken()
      .then((token) =>
        fetchKommoLeads(
          { fechaInicio, fechaFin },
          { accessToken: token ?? undefined }
        )
      )
      .then(setSdrRows)
      .catch((err) => setErrorSdr(err instanceof Error ? err.message : 'Error al cargar datos SDR'))
      .finally(() => setLoadingSdr(false));
  }, [activeTab, fechaInicio, fechaFin, getAccessToken]);

  /** Meta es la fuente de verdad: solo mostrar en SDR los leads cuyo ad_id está en los ads del cliente seleccionado */
  const metaAdIds = useMemo(() => new Set(ads.map((a) => a.metaId)), [ads]);
  const sdrRowsForClient = useMemo(
    () => sdrRows.filter((r) => metaAdIds.has(r.ad_id)),
    [sdrRows, metaAdIds]
  );

  const handleExportCsvGestor = () => exportCsvAds(ads);
  const handleExportCsvSdr = () => exportCsvSdr(sdrRowsForClient);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-gray-500">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <header className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            {user?.email ?? 'Usuario'}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
          >
            Cerrar sesión
          </button>
        </header>
        {errorAccounts && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <p className="font-medium">No se pudieron cargar los clientes.</p>
            <p className="mt-1 text-amber-700">{errorAccounts}</p>
          </div>
        )}
        <ClientSelector
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelect={setSelectedAccountId}
        />
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">Desde</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">Hasta</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </label>
        </div>
        <TabNav
          active={activeTab}
          onSelect={setActiveTab}
          gestorCount={ads.length}
          sdrCount={sdrRowsForClient.length}
        />

        {activeTab === 'gestor' && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-12 text-gray-500">
                Cargando datos…
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {!loading && (
              <ResultsTable rows={ads} onExportCsv={handleExportCsvGestor} />
            )}
          </>
        )}

        {activeTab === 'sdr' && (
          <>
            {loadingSdr && (
              <div className="flex items-center justify-center py-12 text-gray-500">
                Cargando datos SDR…
              </div>
            )}
            {errorSdr && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {errorSdr}
              </div>
            )}
            {!loadingSdr && (
              <SdrEntryView
                rows={sdrRowsForClient}
                onExportCsv={handleExportCsvSdr}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
