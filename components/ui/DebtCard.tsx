interface DebtCardProps {
  debt: {
    name: string;
    remaining: string;
    interestRate: string;
    dueDate: string;
    progress: number;
    status: 'urgent' | 'in-progress' | 'upcoming';
  };
}

export default function DebtCard({ debt }: DebtCardProps) {
  const statusStyles = {
    urgent: 'bg-rose-50 text-rose-700',
    'in-progress': 'bg-sky-50 text-sky-700',
    upcoming: 'bg-amber-50 text-amber-700'
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{debt.status.replace('-', ' ')}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{debt.name}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[debt.status]}`}> {debt.status.replace('-', ' ')} </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Saldo restante</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{debt.remaining}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Interés</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{debt.interestRate}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
          <span>Vence</span>
          <span>{debt.dueDate}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-900" style={{ width: `${debt.progress}%` }} />
        </div>
      </div>
    </div>
  );
}
