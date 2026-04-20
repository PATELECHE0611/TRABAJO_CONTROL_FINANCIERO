import AppShell from '@/components/layout/AppShell';
import DebtCard from '@/components/ui/DebtCard';
import { baseUrl } from '@/lib/api';

interface DebtItem {
  id: string;
  name: string;
  remaining: number;
  interestRate: number;
  dueDate: string;
  status: 'URGENT' | 'IN_PROGRESS' | 'UPCOMING' | 'PAID';
}

const normalizeStatus = (status: DebtItem['status']) => {
  if (status === 'URGENT') return 'urgent';
  if (status === 'IN_PROGRESS') return 'in-progress';
  if (status === 'UPCOMING') return 'upcoming';
  return 'paid';
};

export default async function DebtsPage() {
  const response = await fetch(new URL('/api/debts', baseUrl).toString(), { cache: 'no-store' });
  const { data: debts } = await response.json();

  return (
    <AppShell title="Deudas">
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-3">
          {(debts as DebtItem[]).map((debt) => (
            <DebtCard
              key={debt.id}
              debt={{
                name: debt.name,
                remaining: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(debt.remaining),
                interestRate: `${debt.interestRate}% TAE`,
                dueDate: new Date(debt.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                progress: Math.round((1 - debt.remaining / Number(debt.remaining + 1)) * 100),
                status: normalizeStatus(debt.status) as 'urgent' | 'in-progress' | 'upcoming'
              }}
            />
          ))}
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold">Estrategia de Pago "Bola de Nieve" Recomendada</h2>
          <p className="mt-4 text-slate-600">Si destinas $500 adicionales este mes al Préstamo del Auto, reducirás 3 meses de intereses acumulados.</p>
          <button className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">Ver plan de amortización</button>
        </div>
      </div>
    </AppShell>
  );
}
