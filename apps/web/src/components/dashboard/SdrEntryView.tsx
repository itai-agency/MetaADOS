'use client';

import { useState, useEffect } from 'react';
import type { ManualAdRow } from '@/lib/api/ads';
import { fetchManualAd, updateManualAdFull, updateManualAdSdr } from '@/lib/api/ads';
import { ResultsTable } from './ResultsTable';
import type { AdRow } from '@/lib/mock-ads';

const formatMoney = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Convierte filas manuales a formato de tabla (solo entradas manuales, separadas de las automáticas). */
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

interface SdrEntryViewProps {
  manualRows: ManualAdRow[];
  onExportCsv: () => void;
  onManualUpdated?: () => void;
  getAccessToken: () => Promise<string | null>;
}

export function SdrEntryView({ manualRows, onExportCsv, onManualUpdated, getAccessToken }: SdrEntryViewProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [detail, setDetail] = useState<ManualAdRow | null>(null);
  const [leadsCalificados, setLeadsCalificados] = useState(0);
  const [notasSdr, setNotasSdr] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingRow, setEditingRow] = useState<ManualAdRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (manualRows.length > 0 && !selectedId) setSelectedId(manualRows[0].ad_id);
    if (manualRows.length > 0 && selectedId && !manualRows.some((m) => m.ad_id === selectedId)) {
      setSelectedId(manualRows[0].ad_id);
    }
  }, [manualRows, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setLeadsCalificados(0);
      setNotasSdr('');
      return;
    }
    const fromList = manualRows.find((m) => m.ad_id === selectedId);
    if (fromList) {
      setDetail(fromList);
      setLeadsCalificados(fromList.qualified_leads ?? 0);
      setNotasSdr(fromList.sdr_notes ?? '');
    } else {
      getAccessToken()
        .then((token) => fetchManualAd(selectedId, { accessToken: token ?? undefined }))
        .then((row) => {
          setDetail(row ?? null);
          if (row) {
            setLeadsCalificados(row.qualified_leads ?? 0);
            setNotasSdr(row.sdr_notes ?? '');
          } else {
            setLeadsCalificados(0);
            setNotasSdr('');
          }
        })
        .catch(() => {
          setDetail(null);
          setLeadsCalificados(0);
          setNotasSdr('');
        });
    }
  }, [selectedId, manualRows, getAccessToken]);

  const handleGuardarSdr = async () => {
    if (!selectedId) return;
    setSaveError('');
    setSaveSuccess(false);
    setSaving(true);
    try {
      const token = await getAccessToken();
      await updateManualAdSdr(
        selectedId,
        { qualifiedLeads: leadsCalificados, sdrNotes: notasSdr },
        { accessToken: token ?? undefined }
      );
      setSaveSuccess(true);
      setDetail((prev) =>
        prev ? { ...prev, qualified_leads: leadsCalificados, sdr_notes: notasSdr } : null
      );
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row: AdRow) => {
    const manual = manualRows.find((m) => m.ad_id === row.metaId);
    if (manual) setEditingRow({ ...manual });
  };

  const handleSaveFullEdit = async () => {
    if (!editingRow) return;
    setEditError('');
    setEditSaving(true);
    try {
      const token = await getAccessToken();
      await updateManualAdFull(
        editingRow.ad_id,
        {
          adName: editingRow.ad_name,
          audience: editingRow.audience,
          ctr: Number(editingRow.ctr),
          cpm: Number(editingRow.cpm),
          totalLeads: editingRow.total_leads ?? 0,
          costPerLead: Number(editingRow.cost_per_lead),
          totalInvestment: Number(editingRow.total_investment),
          qualifiedLeads: editingRow.qualified_leads ?? 0,
          sdrNotes: editingRow.sdr_notes ?? '',
        },
        { accessToken: token ?? undefined }
      );
      onManualUpdated?.();
      setEditingRow(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setEditSaving(false);
    }
  };

  const tableRows = manualRowsToAdRows(manualRows);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar anuncio por Meta ID
          </h2>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="sm:max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          >
            <option value="">{manualRows.length === 0 ? 'Sin entradas manuales para este cliente' : 'Seleccionar…'}</option>
            {manualRows.map((m) => (
              <option key={m.ad_id} value={m.ad_id}>
                {m.ad_id} - {m.ad_name.slice(0, 35)}{m.ad_name.length > 35 ? '…' : ''}
              </option>
            ))}
          </select>
        </div>

        {detail && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">Meta ID</p>
              <p className="text-sm font-medium text-gray-900 font-mono">{detail.ad_id}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 uppercase">Ad Name</p>
              <p className="text-sm font-medium text-gray-900 truncate">{detail.ad_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Audience</p>
              <p className="text-sm font-medium text-gray-900">{detail.audience}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Leads</p>
              <p className="text-sm font-medium text-gray-900">{detail.total_leads}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">CTR</p>
              <p className="text-sm font-medium text-gray-900">{detail.ctr}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Cost/Lead</p>
              <p className="text-sm font-medium text-gray-900">{formatMoney(detail.cost_per_lead)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Spend</p>
              <p className="text-sm font-medium text-gray-900">{formatMoney(detail.total_investment)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Leads calificados +</label>
            <input
              type="number"
              min={0}
              value={leadsCalificados}
              onChange={(e) => setLeadsCalificados(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas SDR</label>
            <input
              type="text"
              value={notasSdr}
              onChange={(e) => setNotasSdr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Ej: No answer after 3 attempts"
            />
          </div>
        </div>
        {(saveError || saveSuccess) && (
          <p className={`text-sm mb-2 ${saveError ? 'text-red-600' : 'text-emerald-600'}`}>
            {saveError || 'Datos SDR guardados correctamente.'}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGuardarSdr}
            disabled={saving || !selectedId}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar Datos SDR'}
          </button>
          <button
            type="button"
            onClick={() => {
              setLeadsCalificados(detail?.qualified_leads ?? 0);
              setNotasSdr(detail?.sdr_notes ?? '');
            }}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </section>

      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Editar anuncio manual</h3>
              <p className="text-sm text-gray-500 mt-0.5 font-mono">{editingRow.ad_id}</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del anuncio</label>
                <input
                  type="text"
                  value={editingRow.ad_name}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, ad_name: e.target.value } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Audiencia</label>
                <input
                  type="text"
                  value={editingRow.audience}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, audience: e.target.value } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CTR</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={editingRow.ctr}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, ctr: Number(e.target.value) || 0 } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPM</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={editingRow.cpm}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, cpm: Number(e.target.value) || 0 } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total leads</label>
                <input
                  type="number"
                  min={0}
                  value={editingRow.total_leads ?? ''}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, total_leads: Number(e.target.value) || 0 } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Costo por lead</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={editingRow.cost_per_lead ?? ''}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, cost_per_lead: Number(e.target.value) || 0 } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Inversión total</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={editingRow.total_investment ?? ''}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, total_investment: Number(e.target.value) || 0 } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Leads calificados</label>
                <input
                  type="number"
                  min={0}
                  value={editingRow.qualified_leads ?? ''}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, qualified_leads: Number(e.target.value) || 0 } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notas SDR</label>
                <input
                  type="text"
                  value={editingRow.sdr_notes ?? ''}
                  onChange={(e) => setEditingRow((r) => (r ? { ...r, sdr_notes: e.target.value } : null))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Ej: No answer after 3 attempts"
                />
              </div>
            </div>
            {editError && (
              <div className="px-6 pb-2 text-sm text-red-600">{editError}</div>
            )}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setEditingRow(null); setEditError(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFullEdit}
                disabled={editSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md disabled:opacity-50"
              >
                {editSaving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultsTable rows={tableRows} onExportCsv={onExportCsv} onEdit={handleEdit} />
    </div>
  );
}
