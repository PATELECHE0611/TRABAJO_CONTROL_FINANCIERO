import Link from 'next/link';

const navigation = [
  { label: '📊 Panel Principal', href: '/' },
  { label: '💳 Cuentas', href: '/accounts' },
  { label: '📝 Transacciones', href: '/transactions' },
  { label: '💰 Presupuestos', href: '/budgets' },
  { label: '⚠️ Deudas', href: '/debts' }
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 h-full w-72 border-r border-slate-200 bg-white px-6 py-8 shadow-soft">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white text-lg font-bold">💰</div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Control Financiero</p>
          <p className="text-sm text-slate-600">Gestión de Finanzas</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-3xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">
            {item.label}
          </Link>
        ))}
      </nav>

      <button className="mt-10 inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
        ➕ Nueva Transacción
      </button>
    </aside>
  );
}
