'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TabNav, ClientSelector, AdManagerForm, SdrEntryView, ResultsTable } from '@/components/dashboard';
import type { AdRow } from '@/lib/mock-ads';
import { fetchAds, fetchAccounts, fetchManualAds } from '@/lib/api/ads';
import type { AccountItem, ManualAdRow } from '@/lib/api/ads';
import { useAuth } from '@/contexts/AuthContext';

function exportCsv(rows: AdRow[]) {
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

/** Meta es la única fuente de verdad: ad_id ↔ cliente. Filtra manual para mostrar solo entradas cuyo ad_id pertenece al cliente seleccionado. */
function filterManualByMetaClient(adsFromMeta: AdRow[], manualRows: ManualAdRow[]): ManualAdRow[] {
  const metaAdIds = new Set(adsFromMeta.map((a) => a.metaId));
  return manualRows.filter((m) => metaAdIds.has(m.ad_id));
}

function manualRowsToAdRows(rows: ManualAdRow[]): AdRow[] {
  return rows.map((r) => {
    const leads = r.total_leads ?? 0;
    const calificados = r.qualified_leads ?? 0;
    const tasaCali = leads > 0 ? Math.round((calificados / leads) * 100) : 0;
    const costoLc = calificados > 0 ? Number((r.total_investment / calificados).toFixed(2)) : null;
    const puntaje = tasaCali >= 100 ? 70 : tasaCali >= 60 ? 50 : 30;
    return {
      metaId: r.ad_id,
      anuncio: r.ad_name,
      audiencia: r.audience,
      ctr: Number(r.ctr) ?? 0,
      cpm: Number(r.cpm) ?? 0,
      leads,
      costoLead: Number(r.cost_per_lead) ?? 0,
      inversion: Number(r.total_investment) ?? 0,
      calificados,
      tasaCali,
      costoLc,
      puntaje,
      hasSdr: calificados > 0 || (r.sdr_notes != null && r.sdr_notes !== ''),
    };
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { getAccessToken, user, signOut, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'gestor' | 'sdr'>('gestor');
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [ads, setAds] = useState<AdRow[]>([]);
  const [manualAds, setManualAds] = useState<ManualAdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingManual, setLoadingManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorManual, setErrorManual] = useState<string | null>(null);
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
      .then((token) => fetchAds({ accountId: selectedAccountId }, { accessToken: token ?? undefined }))
      .then(setAds)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar datos'))
      .finally(() => setLoading(false));
  }, [selectedAccountId, getAccessToken]);

  useEffect(() => {
    if (activeTab !== 'sdr') return;
    setLoadingManual(true);
    setErrorManual(null);
    getAccessToken()
      .then((token) => fetchManualAds({ accessToken: token ?? undefined }))
      .then(setManualAds)
      .catch((err) => setErrorManual(err instanceof Error ? err.message : 'Error al cargar datos manuales'))
      .finally(() => setLoadingManual(false));
  }, [activeTab, getAccessToken]);

  const manualForClient = filterManualByMetaClient(ads, manualAds);
  const handleExportCsvGestor = () => exportCsv(ads);
  const handleExportCsvSdr = () => exportCsv(manualRowsToAdRows(manualForClient));

  const handleManualUpdated = () => {
    getAccessToken()
      .then((token) => fetchManualAds({ accessToken: token ?? undefined }))
      .then(setManualAds);
  };

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
        <TabNav
          active={activeTab}
          onSelect={setActiveTab}
          gestorCount={ads.length}
          sdrCount={manualForClient.length}
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
              <>
                <AdManagerForm getAccessToken={getAccessToken} />
                <ResultsTable rows={ads} onExportCsv={handleExportCsvGestor} />
              </>
            )}
          </>
        )}

        {activeTab === 'sdr' && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-12 text-gray-500">
                Cargando anuncios del cliente…
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {!loading && (
              <>
                {loadingManual && (
                  <div className="text-sm text-gray-500 mb-2">Cargando datos SDR…</div>
                )}
                {errorManual && (
                  <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
                    {errorManual}
                  </div>
                )}
                <SdrEntryView
                  manualRows={manualForClient}
                  onExportCsv={handleExportCsvSdr}
                  onManualUpdated={handleManualUpdated}
                  getAccessToken={getAccessToken}
                />
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
