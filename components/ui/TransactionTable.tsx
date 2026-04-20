'use client';

interface TransactionItem {
  id: string;
  description: string;
  category: string;
  account: string;
  date: string;
  amount: string;
  type: 'income' | 'expense';
}

interface TransactionTableProps {
  items: TransactionItem[];
  onDeleteRequest?: (id: string) => void;
}

export default function TransactionTable({ items, onDeleteRequest }: TransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50 text-sm uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="px-6 py-4">Entidad</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Categoría</th>
            <th className="px-6 py-4">Cuenta</th>
            <th className="px-6 py-4 text-right">Monto</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4">
                <div className="font-medium text-slate-900">{item.description}</div>
                <div className="text-xs text-slate-500">{item.type === 'income' ? 'Ingreso' : 'Gasto'}</div>
              </td>
              <td className="px-6 py-4">{item.date}</td>
              <td className="px-6 py-4">{item.category}</td>
              <td className="px-6 py-4">{item.account}</td>
              <td className={`px-6 py-4 text-right font-semibold ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.amount}</td>
              <td className="px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onDeleteRequest?.(item.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
