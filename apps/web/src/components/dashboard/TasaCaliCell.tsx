interface TasaCaliCellProps {
  tasa: number;
}

export function TasaCaliCell({ tasa }: TasaCaliCellProps) {
  const is100 = tasa === 100;
  const isGood = tasa >= 60 && tasa < 100;
  const color = is100 ? 'text-blue-600 font-medium' : isGood ? 'text-emerald-600' : 'text-gray-600';
  return <span className={color}>{tasa}%</span>;
}
