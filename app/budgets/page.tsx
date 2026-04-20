import AppShell from '@/components/layout/AppShell';
import BudgetCard from '@/components/ui/BudgetCard';
import AlertBanner from '@/components/ui/AlertBanner';
import { baseUrl } from '@/lib/api';

interface BudgetItem {
  id: string;
  spent: number;
  limit: number;
  category: { name: string };
}

export default async function BudgetsPage() {
  const response = await fetch(new URL('/api/budgets', baseUrl).toString(), { cache: 'no-store' });
  const { data: budgets } = await response.json();

  const cards = (budgets as BudgetItem[]).map((budget) => ({
    category: budget.category.name,
    used: Number(budget.spent),
    limit: Number(budget.limit),
    color: budget.category.name === 'Alimentación' ? 'red' : budget.category.name === 'Salud' ? 'emerald' : budget.category.name === 'Ocio' ? 'lime' : 'blue'
  }));

  return (
    <AppShell title="Presupuestos">
      <div className="space-y-6">
        <AlertBanner title="⚠️ Alimentación Crítico" description="Has superado el 90% de tu límite mensual. Te quedan $50 para el resto del mes." variant="danger" />
        <AlertBanner title="💡 Sugerencia de Ocio" description="Estás gastando menos de lo proyectado. Podrías mover $100 a tus ahorros." variant="info" />

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {cards.map((budget) => (
            <BudgetCard key={budget.category} category={budget.category} used={budget.used} limit={budget.limit} color={budget.color} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-8">
            <h2 className="text-xl font-semibold">Tu salud financiera está en su mejor momento.</h2>
            <p className="mt-4 text-slate-600">Has ahorrado un 12% más que el mes pasado evitando gastos innecesarios en la categoría de Ocio.</p>
            <div className="mt-6 flex gap-3">
              <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">Ver informe detallado</button>
              <button className="rounded-full border border-slate-300 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">Más información</button>
            </div>
          </div>

          <div className="card p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Meta de Ahorro</p>
              <span className="text-sm text-slate-500">70%</span>
            </div>
            <div className="mt-8 flex h-48 items-center justify-center rounded-[24px] bg-slate-100">
              <div className="text-center">
                <p className="text-5xl font-semibold text-emerald-600">70%</p>
                <p className="mt-3 text-slate-600">Fondo de Vacaciones</p>
                <p className="mt-2 text-sm text-slate-500">Estás a solo $300 de alcanzar tu meta de vacaciones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
