'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdRow, TableFilter } from '@/lib/mock-ads';
import { AudiencePill } from './AudiencePill';
import { CtrBar } from './CtrBar';
import { TasaCaliCell } from './TasaCaliCell';
import { ScoreCircle } from './ScoreCircle';

interface ResultsTableProps {
  rows: AdRow[];
  onExportCsv?: () => void;
  onEdit?: (row: AdRow) => void;
}

const FIXED_FILTERS = ['CON SDR', 'CTR ALTO'] as const;

function getAudienceFilters(rows: AdRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.audiencia && String(r.audiencia).trim()) set.add(String(r.audiencia).trim());
  }
  return Array.from(set).sort();
}

export function ResultsTable({ rows, onExportCsv, onEdit }: ResultsTableProps) {
  const audienceFilters = useMemo(() => getAudienceFilters(rows), [rows]);
  const filters = useMemo(
    () => (['ALL', ...audienceFilters, ...FIXED_FILTERS] as const),
    [audienceFilters]
  );
  const [filter, setFilter] = useState<TableFilter>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return rows;
    if (filter === 'CON SDR') return rows.filter((r) => r.hasSdr);
    if (filter === 'CTR ALTO') return rows.filter((r) => (r.ctr ?? 0) >= 1);
    return rows.filter((r) => r.audiencia === filter);
  }, [rows, filter]);

  useEffect(() => {
    const valid = filter === 'ALL' || filter === 'CON SDR' || filter === 'CTR ALTO' || audienceFilters.includes(filter);
    if (!valid) setFilter('ALL');
  }, [filter, audienceFilters]);

  const formatMoney = (n: number | null | undefined) => {
    if (n == null || Number.isNaN(Number(n))) return '—';
    return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Resultados</h2>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
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
      </div>

      <div className="table-wrap">
        <table className="w-full min-w-[900px] text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Meta ID</th>
              <th className="px-4 py-3 font-medium">Anuncio</th>
              <th className="px-4 py-3 font-medium">Audiencia</th>
              <th className="px-4 py-3 font-medium">CTR</th>
              <th className="px-4 py-3 font-medium">CPM</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Costo/Lead</th>
              <th className="px-4 py-3 font-medium">Inversión</th>
              <th className="px-4 py-3 font-medium">Calificado</th>
              <th className="px-4 py-3 font-medium">Tasa Calificado</th>
              <th className="px-4 py-3 font-medium">Costo/LC</th>
              <th className="px-4 py-3 font-medium">Puntaje</th>
              <th className="px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((row) => (
              <tr key={row.metaId} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-mono text-gray-900">{row.metaId}</td>
                <td className="px-4 py-3 text-gray-900 max-w-[180px] truncate" title={row.anuncio}>{row.anuncio}</td>
                <td className="px-4 py-3">
                  <AudiencePill audiencia={row.audiencia} />
                </td>
                <td className="px-4 py-3">
                  <CtrBar ctr={row.ctr ?? 0} />
                </td>
                <td className="px-4 py-3 tabular-nums text-gray-700">{formatMoney(row.cpm)}</td>
                <td className="px-4 py-3 tabular-nums text-gray-700">{row.leads ?? 0}</td>
                <td className="px-4 py-3 tabular-nums text-gray-700">{formatMoney(row.costoLead)}</td>
                <td className="px-4 py-3 tabular-nums text-gray-700">{formatMoney(row.inversion)}</td>
                <td className="px-4 py-3 tabular-nums text-gray-700">{row.calificados ?? 0}</td>
                <td className="px-4 py-3">
                  <TasaCaliCell tasa={row.tasaCali ?? 0} />
                </td>
                <td className="px-4 py-3 tabular-nums text-gray-700">{formatMoney(row.costoLc)}</td>
                <td className="px-4 py-3">
                  <ScoreCircle puntaje={row.puntaje ?? 0} />
                </td>
                <td className="px-4 py-3">
                  {onEdit ? (
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                    >
                      Editar
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
