type AudiencePillProps = { audiencia: string };

export function AudiencePill({ audiencia }: AudiencePillProps) {
  const isDdo = audiencia === 'DDO';
  const isAdv = audiencia === 'ADV';
  const bg = isDdo ? 'bg-violet-100 text-violet-800' : isAdv ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}>
      {audiencia}
    </span>
  );
}
