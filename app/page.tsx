import AppShell from '@/components/layout/AppShell';
import AlertBanner from '@/components/ui/AlertBanner';
import KpiCard from '@/components/ui/KpiCard';
import TransactionTable from '@/components/ui/TransactionTable';
import BudgetCard from '@/components/ui/BudgetCard';
import { baseUrl } from '@/lib/api';

interface TransactionItem {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string | null;
  date: string;
  account: { name: string };
  category: { name: string };
}

interface BudgetItem {
  id: string;
  limit: number;
  spent: number;
  category: { name: string };
}

interface AccountItem {
  id: string;
  balance: number;
  type: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

export default async function DashboardPage() {
  const [transactionRes, budgetRes, accountRes] = await Promise.all([
    fetch(new URL('/api/transactions', baseUrl).toString(), { cache: 'no-store' }),
    fetch(new URL('/api/budgets', baseUrl).toString(), { cache: 'no-store' }),
    fetch(new URL('/api/accounts', baseUrl).toString(), { cache: 'no-store' })
  ]);

  const [{ data: transactions }, { data: budgets }, { data: accounts }] = await Promise.all([
    transactionRes.json(),
    budgetRes.json(),
    accountRes.json()
  ]);

  const currentMonth = new Date().getMonth();

  const parseAmount = (value: string | number) => Number(value ?? 0);

  const recentTransactions = (transactions as TransactionItem[])
    .slice(0, 5)
    .map((transaction) => {
      const amountValue = parseAmount(transaction.amount);
      return {
        id: transaction.id,
        description: transaction.description ?? 'Transacción',
        category: transaction.category.name,
        account: transaction.account.name,
        date: new Date(transaction.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: transaction.type === 'INCOME' ? `+${formatCurrency(amountValue)}` : `-${formatCurrency(amountValue)}`,
        type: transaction.type === 'INCOME' ? 'income' : 'expense'
      };
    });

  const monthlyIncome = (transactions as TransactionItem[])
    .filter((item) => new Date(item.date).getMonth() === currentMonth && item.type === 'INCOME')
    .reduce((sum, item) => sum + parseAmount(item.amount), 0);

  const monthlyExpenses = (transactions as TransactionItem[])
    .filter((item) => new Date(item.date).getMonth() === currentMonth && item.type === 'EXPENSE')
    .reduce((sum, item) => sum + parseAmount(item.amount), 0);

  const totalBalance = (accounts as AccountItem[]).reduce((sum, account) => sum + Number(account.balance), 0);
  const savingsBalance = (accounts as AccountItem[])
    .filter((account) => account.type === 'SAVINGS')
    .reduce((sum, account) => sum + Number(account.balance), 0);

  const kpis = [
    { label: 'Saldo Total', value: formatCurrency(totalBalance), trend: '+4.2% vs mes anterior', icon: '💼' },
    { label: 'Ingresos del mes', value: formatCurrency(monthlyIncome), trend: 'Ingresos netos', icon: '⬆️' },
    { label: 'Gastos del mes', value: formatCurrency(monthlyExpenses), trend: 'Gastos totales', icon: '⬇️' },
    { label: 'Ahorro', value: formatCurrency(savingsBalance), trend: 'Objetivos activos', icon: '💰' }
  ];

  const budgetCards = (budgets as BudgetItem[]).slice(0, 4).map((budget) => ({
    category: budget.category.name,
    used: Number(budget.spent),
    limit: Number(budget.limit),
    color: 'blue' as const
  }));

  return (
    <AppShell title="Panel General">
      <div className="space-y-6">
        <AlertBanner title="Cerca del límite" description="Has alcanzado el 92% de tu presupuesto de Alimentación este mes." variant="warning" />

        <div className="grid gap-6 xl:grid-cols-4 lg:grid-cols-2">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} trend={kpi.trend} icon={kpi.icon} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="card p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Evolución de flujo</h2>
              <span className="text-sm text-slate-500">Últimos 6 meses</span>
            </div>
            <div className="h-72 rounded-[24px] bg-slate-100" />
          </section>

          <section className="card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gastos por categoría</h2>
              <span className="text-sm text-slate-500">Distribución</span>
            </div>
            <div className="h-72 rounded-[24px] bg-slate-100" />
          </section>
        </div>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="card p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Transacciones recientes</h2>
                <p className="text-sm text-slate-500">Últimos movimientos importados desde tus cuentas.</p>
              </div>
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">Ver todas</button>
            </div>
            <TransactionTable items={recentTransactions} />
          </div>

          <div className="space-y-5">
            {budgetCards.map((budget) => (
              <BudgetCard key={budget.category} category={budget.category} used={budget.used} limit={budget.limit} color={budget.color} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
