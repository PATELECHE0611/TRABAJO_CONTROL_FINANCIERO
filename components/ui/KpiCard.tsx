interface KpiCardProps {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

export default function KpiCard({ label, value, trend, icon }: KpiCardProps) {
  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">KPI</span>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{trend}</p>
    </div>
  );
}
