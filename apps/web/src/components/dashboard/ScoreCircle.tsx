interface ScoreCircleProps {
  puntaje: number;
}

export function ScoreCircle({ puntaje }: ScoreCircleProps) {
  const isHigh = puntaje >= 60;
  const isMid = puntaje >= 30 && puntaje < 60;
  const bg = isHigh ? 'bg-emerald-500' : isMid ? 'bg-amber-500' : 'bg-red-500';
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-semibold ${bg}`}>
      {puntaje}
    </span>
  );
}
