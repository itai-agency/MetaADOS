interface CtrBarProps {
  ctr: number;
}

export function CtrBar({ ctr }: CtrBarProps) {
  const pct = Math.min(100, (ctr / 3) * 100);
  const isHigh = ctr >= 1;
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <span className="text-sm tabular-nums shrink-0">{ctr}%</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
        <div
          className={`h-full rounded-full ${isHigh ? 'bg-emerald-500' : 'bg-gray-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
