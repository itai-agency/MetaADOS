'use client';

import type { AccountItem } from '@/lib/api/ads';

interface ClientSelectorProps {
  accounts: AccountItem[];
  selectedAccountId: string;
  onSelect: (accountId: string) => void;
  loading?: boolean;
}

export function ClientSelector({
  accounts,
  selectedAccountId,
  onSelect,
  loading,
}: ClientSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-1">Cliente (cuenta publicitaria)</label>
      <select
        value={selectedAccountId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={loading}
        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-50"
      >
        <option value="">Seleccionar cliente...</option>
        {accounts.map((acc) => (
          <option key={acc.account_id} value={acc.account_id}>
            {acc.account_name} ({acc.account_id})
          </option>
        ))}
      </select>
    </div>
  );
}
