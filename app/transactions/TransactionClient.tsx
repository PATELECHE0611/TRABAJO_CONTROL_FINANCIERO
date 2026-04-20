'use client';

import { useMemo, useState } from 'react';
import TransactionTable from '@/components/ui/TransactionTable';
import Modal from '@/components/ui/Modal';
import AlertBanner from '@/components/ui/AlertBanner';
import { baseUrl } from '@/lib/api';

interface TransactionItem {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string | null;
  date: string;
  account: { id: string; name: string };
  category: { id: string; name: string };
}

interface AccountItem {
  id: string;
  name: string;
  userId: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface TransactionClientProps {
  transactions: TransactionItem[];
  accounts: AccountItem[];
  categories: CategoryItem[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

export default function TransactionClient({ transactions, accounts, categories }: TransactionClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [transactionItems, setTransactionItems] = useState(transactions);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    accountId: accounts[0]?.id ?? '',
    categoryId: categories[0]?.id ?? '',
    date: new Date().toISOString().slice(0, 10)
  });

  const categoriesOptions = ['All', ...new Set(transactionItems.map((item) => item.category.name))];

  const formatAmountInputValue = (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, '');
    const lastSeparatorIndex = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
    const hasDecimal = lastSeparatorIndex > 0;
    const integerPart = hasDecimal ? cleaned.slice(0, lastSeparatorIndex) : cleaned;
    const decimalPart = hasDecimal ? cleaned.slice(lastSeparatorIndex + 1) : '';
    const normalizedInteger = integerPart.replace(/[^0-9]/g, '').replace(/^0+(?=[1-9])/, '') || '0';
    const groupedInteger = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decimalPart ? `${groupedInteger},${decimalPart.slice(0, 2)}` : groupedInteger;
  };

  const parseAmountValue = (value: string) => {
    const normalized = value.replace(/\./g, '').replace(',', '.');
    return Number(normalized || 0);
  };

  const filteredTransactions = useMemo(() => {
    return transactionItems
      .filter((item) => {
        const matchesSearch = [item.description, item.category.name, item.account.name]
          .filter(Boolean)
          .some((field) => field?.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || item.category.name === selectedCategory;
        const matchesType = selectedType === 'All' || item.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        const keyA = sortField === 'amount' ? a.amount : new Date(a.date).getTime();
        const keyB = sortField === 'amount' ? b.amount : new Date(b.date).getTime();
        return sortDirection === 'asc' ? Number(keyA - keyB) : Number(keyB - keyA);
      });
  }, [transactionItems, search, selectedCategory, selectedType, sortField, sortDirection]);

  const rows = filteredTransactions.map((transaction) => ({
    id: transaction.id,
    description: transaction.description ?? 'Transacción',
    category: transaction.category.name,
    account: transaction.account.name,
    date: new Date(transaction.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    amount: transaction.type === 'INCOME' ? `+${formatCurrency(transaction.amount)}` : `-${formatCurrency(transaction.amount)}`,
    type: transaction.type === 'INCOME' ? 'income' : 'expense'
  }));

  const handleDeleteRequest = (transactionId: string) => {
    setDeleteTargetId(transactionId);
    setDeleteReason('');
    setDeleteModalOpen(true);
    setDeleteMessage(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId || deleteReason.trim().length === 0) {
      return;
    }

    const response = await fetch(new URL(`/api/transactions/${deleteTargetId}`, baseUrl).toString(), {
      method: 'DELETE'
    });

    if (response.ok) {
      setTransactionItems((current) => current.filter((item) => item.id !== deleteTargetId));
      setDeleteMessage(`La transacción se eliminó por el motivo: ${deleteReason}`);
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteReason('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userId = accounts[0]?.userId ?? '';

    const response = await fetch(new URL('/api/transactions', baseUrl).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseAmountValue(form.amount),
        type: form.type,
        description: form.description,
        date: form.date,
        accountId: form.accountId,
        categoryId: form.categoryId,
        userId
      })
    });

    if (response.ok) {
      const result = await response.json();
      setTransactionItems((current) => [result.data, ...current]);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <div className="card p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Transacciones</h1>
            <p className="text-sm text-slate-500">Gestiona tus registros con filtros, búsqueda y ordenación.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsModalOpen(true)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Agregar Transacción</button>
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Exportar</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-500">Buscar</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Entidad, categoría o cuenta"
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-500">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              {categoriesOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-500">Tipo</label>
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="All">Todos</option>
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Egreso</option>
            </select>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-500">Ordenar</label>
            <div className="mt-3 flex items-center gap-3">
              <select
                value={sortField}
                onChange={(event) => setSortField(event.target.value as 'date' | 'amount')}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="date">Fecha</option>
                <option value="amount">Monto</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                {sortDirection === 'asc' ? 'Asc' : 'Desc'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {deleteMessage ? (
          <AlertBanner title="Transacción eliminada" description={deleteMessage} variant="info" />
        ) : null}
      </div>

      <div className="card p-6">
        <TransactionTable items={rows} onDeleteRequest={handleDeleteRequest} />
      </div>

      <Modal open={isModalOpen} title="Agregar Transacción" onClose={() => setIsModalOpen(false)}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Descripción
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Monto
              <input
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: formatAmountInputValue(event.target.value) })}
                type="text"
                placeholder="0,00"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-700">
              Tipo
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as 'INCOME' | 'EXPENSE' })}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              >
                <option value="EXPENSE">Egreso</option>
                <option value="INCOME">Ingreso</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Cuenta
              <select
                value={form.accountId}
                onChange={(event) => setForm({ ...form, accountId: event.target.value })}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Categoría
              <select
                value={form.categoryId}
                onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Fecha
              <input
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                type="date"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-slate-300 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteModalOpen} title="Confirmar eliminación" onClose={() => setDeleteModalOpen(false)}>
        <div className="space-y-5">
          <p className="text-sm text-slate-600">Por favor, indica el motivo por el cual se elimina esta transacción.</p>
          <textarea
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
            rows={4}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
            placeholder="Escribe el motivo aquí..."
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setDeleteModalOpen(false)} className="rounded-full border border-slate-300 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={handleConfirmDelete} disabled={!deleteReason.trim()} className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-rose-700">Eliminar</button>
          </div>
        </div>
      </Modal>

      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800"
        >
          🏠 Home
        </a>
      </div>
    </>
  );
}
