'use client';

type TabId = 'gestor' | 'sdr';

interface TabNavProps {
  active: TabId;
  onSelect: (tab: TabId) => void;
  gestorCount?: number;
  sdrCount?: number;
}

export function TabNav({ active, onSelect, gestorCount = 6, sdrCount = 6 }: TabNavProps) {
  return (
    <nav className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-200 mb-6">
      <button
        type="button"
        onClick={() => onSelect('gestor')}
        className={`
          flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
          ${active === 'gestor'
            ? 'border-gray-900 text-gray-900 bg-gray-50'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Gestor de Anuncios
        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
          {gestorCount}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onSelect('sdr')}
        className={`
          flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
          ${active === 'sdr'
            ? 'border-gray-900 text-gray-900 bg-gray-50'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Entrada SDR
        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
          {sdrCount}
        </span>
      </button>
    </nav>
  );
}
