interface BudgetCardProps {
  category: string;
  used: number;
  limit: number;
  color: 'red' | 'blue' | 'emerald' | 'lime';
}

export default function BudgetCard({ category, used, limit, color }: BudgetCardProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);
  const backgroundColor = {
    red: 'bg-rose-500',
    blue: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    lime: 'bg-lime-500'
  }[color];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{category}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">${used}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${backgroundColor}`}>{percentage}%</span>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${backgroundColor}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-500">{used} / ${limit}</p>
    </div>
  );
}
