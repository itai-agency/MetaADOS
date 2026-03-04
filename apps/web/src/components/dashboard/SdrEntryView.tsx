'use client';

import type { KommoLeadRow } from '@/lib/api/ads';

interface SdrEntryViewProps {
  rows: KommoLeadRow[];
  onExportCsv: () => void;
}

function formatDateTime(iso: string | null | undefined): string {
  if (iso == null || iso === '') return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('es', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

export function SdrEntryView({ rows, onExportCsv }: SdrEntryViewProps) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Leads Kommo (SDR)</h2>
        <button
          type="button"
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      <div className="table-wrap overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Lead ID</th>
              <th className="px-4 py-3 font-medium">Ad ID</th>
              <th className="px-4 py-3 font-medium">Nombre lead</th>
              <th className="px-4 py-3 font-medium">Estado actual</th>
              <th className="px-4 py-3 font-medium">Último estado válido</th>
              <th className="px-4 py-3 font-medium">Razón pérdida</th>
              <th className="px-4 py-3 font-medium">Created at (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay registros para el rango de fechas seleccionado.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.lead_id}-${row.ad_id}-${row.created_at_utc ?? ''}`} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-gray-900 tabular-nums">{row.lead_id}</td>
                  <td className="px-4 py-3 font-mono text-gray-900">{row.ad_id}</td>
                  <td className="px-4 py-3 text-gray-900 max-w-[180px] truncate" title={row.nombre_lead ?? ''}>
                    {row.nombre_lead ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.estado_actual ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{row.ultimo_estado_valido ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate" title={row.razon_perdida ?? ''}>
                    {row.razon_perdida ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {formatDateTime(row.created_at_utc)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
