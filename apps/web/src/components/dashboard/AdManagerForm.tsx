'use client';

import { useState } from 'react';
import { insertManualAd } from '@/lib/api/ads';

const DEFAULT_AUDIENCIA = '';
const OPCIONES_AUDIENCIA_INICIALES = ['DDO', 'ADV'];

interface AdManagerFormProps {
  getAccessToken: () => Promise<string | null>;
}

export function AdManagerForm({ getAccessToken }: AdManagerFormProps) {
  const [metaId, setMetaId] = useState('');
  const [nombreAnuncio, setNombreAnuncio] = useState('');
  const [audiencia, setAudiencia] = useState(DEFAULT_AUDIENCIA);
  const [opcionesAudiencia, setOpcionesAudiencia] = useState<string[]>(OPCIONES_AUDIENCIA_INICIALES);
  const [audienciaCustom, setAudienciaCustom] = useState('');
  const [errorAudiencia, setErrorAudiencia] = useState('');
  const [ctr, setCtr] = useState('');
  const [cpm, setCpm] = useState('');
  const [totalLeads, setTotalLeads] = useState('');
  const [costoLead, setCostoLead] = useState('');
  const [inversion, setInversion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleAgregarAudiencia = () => {
    setErrorAudiencia('');
    const value = audienciaCustom.trim();
    if (!value) {
      setErrorAudiencia('Escribe un nombre para la audiencia.');
      return;
    }
    const yaExiste = opcionesAudiencia.some((o) => o.toUpperCase() === value.toUpperCase());
    if (yaExiste) {
      setErrorAudiencia('Esa audiencia ya está en la lista.');
      return;
    }
    setOpcionesAudiencia((prev) => [...prev, value].sort((a, b) => a.localeCompare(b)));
    setAudiencia(value);
    setAudienciaCustom('');
  };

  const handleLimpiar = () => {
    setMetaId('');
    setNombreAnuncio('');
    setAudiencia(DEFAULT_AUDIENCIA);
    setOpcionesAudiencia(OPCIONES_AUDIENCIA_INICIALES);
    setAudienciaCustom('');
    setErrorAudiencia('');
    setCtr('');
    setCpm('');
    setTotalLeads('');
    setCostoLead('');
    setInversion('');
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const handleAgregarAnuncio = async () => {
    setSubmitError('');
    setSubmitSuccess(false);

    if (!metaId.trim()) {
      setSubmitError('META ID es requerido.');
      return;
    }
    if (!nombreAnuncio.trim()) {
      setSubmitError('Nombre del anuncio es requerido.');
      return;
    }
    if (!audiencia.trim()) {
      setSubmitError('Selecciona una audiencia.');
      return;
    }

    const ctrNum = Number(ctr.replace(',', '.'));
    const cpmNum = Number(cpm.replace(',', '.'));
    const totalLeadsNum = Number(totalLeads);
    const costoLeadNum = Number(costoLead.replace(',', '.'));
    const inversionNum = Number(inversion.replace(',', '.'));

    if (Number.isNaN(ctrNum) || ctrNum < 0) {
      setSubmitError('CTR debe ser un número válido (≥ 0).');
      return;
    }
    if (Number.isNaN(cpmNum) || cpmNum < 0) {
      setSubmitError('CPM debe ser un número válido (≥ 0).');
      return;
    }
    if (!Number.isInteger(totalLeadsNum) || totalLeadsNum < 0) {
      setSubmitError('Total de leads debe ser un número entero ≥ 0.');
      return;
    }
    if (Number.isNaN(costoLeadNum) || costoLeadNum < 0) {
      setSubmitError('Costo por lead debe ser un número válido (≥ 0).');
      return;
    }
    if (Number.isNaN(inversionNum) || inversionNum < 0) {
      setSubmitError('Inversión total debe ser un número válido (≥ 0).');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getAccessToken();
      await insertManualAd(
        {
          adId: metaId.trim(),
          adName: nombreAnuncio.trim(),
          audience: audiencia.trim(),
        ctr: ctrNum,
        cpm: cpmNum,
        totalLeads: totalLeadsNum,
        costPerLead: costoLeadNum,
        totalInvestment: inversionNum,
        },
        { accessToken: token ?? undefined }
      );
      setSubmitSuccess(true);
      handleLimpiar();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar el anuncio.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Ingresar datos del anuncio
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">META ID *</label>
          <input
            type="text"
            value={metaId}
            onChange={(e) => setMetaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            placeholder="Ej: 120239332252470008"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del anuncio *</label>
          <input
            type="text"
            value={nombreAnuncio}
            onChange={(e) => setNombreAnuncio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            placeholder="Ej: Ad01_msj_ddo - video"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Audiencia *</label>
          <select
            value={audiencia}
            onChange={(e) => setAudiencia(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          >
            <option value="">Seleccionar...</option>
            {opcionesAudiencia.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Agregar audiencia custom</label>
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={audienciaCustom}
                  onChange={(e) => {
                    setAudienciaCustom(e.target.value);
                    setErrorAudiencia('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAgregarAudiencia()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="e.g. RTG, LOOKALIKE"
                />
                <button
                  type="button"
                  onClick={handleAgregarAudiencia}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 whitespace-nowrap"
                >
                  + Agregar
                </button>
              </div>
              {errorAudiencia && (
                <p className="text-xs text-red-600">{errorAudiencia}</p>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">CTR (%) *</label>
          <input
            type="text"
            inputMode="decimal"
            value={ctr}
            onChange={(e) => setCtr(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">CPM ($) *</label>
          <input
            type="text"
            inputMode="decimal"
            value={cpm}
            onChange={(e) => setCpm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Total de leads *</label>
          <input
            type="text"
            inputMode="numeric"
            value={totalLeads}
            onChange={(e) => setTotalLeads(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Costo por lead ($) *</label>
          <input
            type="text"
            inputMode="decimal"
            value={costoLead}
            onChange={(e) => setCostoLead(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Inversión total ($) *</label>
          <input
            type="text"
            inputMode="decimal"
            value={inversion}
            onChange={(e) => setInversion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>
      </div>

      {(submitError || submitSuccess) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${submitError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
        >
          {submitError || 'Anuncio guardado correctamente.'}
        </div>
      )}
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          type="button"
          onClick={handleAgregarAnuncio}
          disabled={submitting}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Guardando…' : 'Agregar Anuncio'}
        </button>
        <button
          type="button"
          onClick={handleLimpiar}
          disabled={submitting}
          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Limpiar
        </button>
      </div>
    </section>
  );
}
