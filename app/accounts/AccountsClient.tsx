'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number | string | { toString: () => string };
  userId: string;
}

const ensureNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (val && typeof val === 'object' && 'toNumber' in val) return val.toNumber();
  if (val && typeof val === 'object' && 'toString' in val) return parseFloat(val.toString());
  return 0;
};

const formatCurrency = (value: any) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(ensureNumber(value));

const getAccountTypeLabel = (type: string): string => {
  const types: { [key: string]: string } = {
    CHECKING: 'Cuenta Corriente',
    SAVINGS: 'Cuenta de Ahorros',
    CREDIT: 'Tarjeta de Crédito'
  };
  return types[type] || type;
};

const getAccountTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    CHECKING: 'bg-blue-100 text-blue-800',
    SAVINGS: 'bg-green-100 text-green-800',
    CREDIT: 'bg-red-100 text-red-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function AccountsClient({ accounts: initialAccounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [transactionModal, setTransactionModal] = useState<{ accountId: string; type: 'income' | 'expense' } | null>(null);
  const [transactionAmount, setTransactionAmount] = useState<string>('');
  const [transactionDescription, setTransactionDescription] = useState<string>('');

  const handleEditClick = (account: Account) => {
    setEditingId(account.id);
    setEditingBalance(account.balance.toString());
  };

  const handleSaveBalance = async (accountId: string) => {
    setLoading(true);
    try {
      const balance = parseFloat(editingBalance);
      
      if (isNaN(balance)) {
        alert('Por favor ingresa un número válido');
        return;
      }

      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance })
      });

      if (!response.ok) throw new Error('Error al actualizar saldo');

      const updatedAccount = await response.json();
      setAccounts(accounts.map(a => a.id === accountId ? updatedAccount : a));
      setEditingId(null);
      router.refresh();
    } catch (error) {
      alert('Error al actualizar el saldo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingBalance('');
  };

  const handleAddTransaction = async (type: 'income' | 'expense') => {
    setLoading(true);
    try {
      const amount = parseFloat(transactionAmount);
      
      if (isNaN(amount) || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        setLoading(false);
        return;
      }

      if (!transactionModal) {
        alert('Selecciona una cuenta');
        setLoading(false);
        return;
      }

      // Get current account
      const account = accounts.find(a => a.id === transactionModal.accountId);
      if (!account) {
        alert('Cuenta no encontrada');
        setLoading(false);
        return;
      }

      const currentBalance = ensureNumber(account.balance);
      const newBalance = type === 'income' 
        ? currentBalance + amount 
        : currentBalance - amount;

      // Validate balance doesn't go too negative for checking accounts
      if (newBalance < 0 && account.type === 'CHECKING') {
        const proceed = confirm(`⚠️ Esto dejará tu cuenta con saldo negativo: ${formatCurrency(newBalance)}\n\n¿Deseas continuar?`);
        if (!proceed) {
          setLoading(false);
          return;
        }
      }

      console.log('📝 Registrando transacción:', { amount, type, currentBalance, newBalance, accountId: account.id });

      // Create transaction
      const transactionResponse = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount.toString(),
          type: type === 'income' ? 'INCOME' : 'EXPENSE',
          description: transactionDescription || (type === 'income' ? 'Ingreso' : 'Egreso'),
          date: new Date().toISOString(),
          accountId: account.id,
          userId: account.userId,
          categoryId: null
        })
      });

      if (!transactionResponse.ok) {
        const errorText = await transactionResponse.text();
        console.error('❌ Error en transacción:', errorText);
        throw new Error(`Error al registrar transacción: ${transactionResponse.status} - ${errorText}`);
      }

      const transactionData = await transactionResponse.json();
      console.log('✅ Transacción registrada:', transactionData);

      // Update account balance
      const updateResponse = await fetch(`/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance })
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('❌ Error al actualizar saldo:', errorText);
        throw new Error(`Error al actualizar saldo: ${updateResponse.status} - ${errorText}`);
      }

      const updatedData = await updateResponse.json();
      console.log('✅ Saldo actualizado:', updatedData);

      // Actualizar el estado local con la respuesta del servidor
      const updatedAccount = updatedData.data || updatedData;
      const finalBalance = ensureNumber(updatedAccount.balance);
      
      setAccounts(prevAccounts => 
        prevAccounts.map(a => 
          a.id === account.id 
            ? { ...a, balance: finalBalance }
            : a
        )
      );
      
      setTransactionModal(null);
      setTransactionAmount('');
      setTransactionDescription('');
      
      alert(`✅ Transacción registrada exitosamente!\n\nNuevo saldo: ${formatCurrency(finalBalance)}`);
      
      // Refresh page data
      setTimeout(() => router.refresh(), 500);
    } catch (error) {
      console.error('❌ Error completo:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mis Cuentas</h1>
        <p className="text-slate-600 mt-2">Gestiona tus cuentas y saldos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div 
            key={account.id} 
            className="rounded-[28px] border border-slate-200 bg-white shadow-soft overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{account.name}</h3>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                    {getAccountTypeLabel(account.type)}
                  </span>
                </div>
              </div>

              {/* Balance */}
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-1">Saldo Actual</p>
                {editingId === account.id ? (
                  <input
                    type="number"
                    value={editingBalance}
                    onChange={(e) => setEditingBalance(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                ) : (
                  <p className={`text-2xl font-bold ${ensureNumber(account.balance) >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    {formatCurrency(account.balance)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {editingId === account.id ? (
                  <>
                    <button
                      onClick={() => handleSaveBalance(account.id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setTransactionModal({ accountId: account.id, type: 'income' })}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      + Ingreso
                    </button>
                    <button
                      onClick={() => setTransactionModal({ accountId: account.id, type: 'expense' })}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      - Egreso
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Modal */}
      {transactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] shadow-lg p-8 w-full max-w-md">
            {/* Header with Type Badge */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white text-sm mb-4 ${
                transactionModal.type === 'income' 
                  ? 'bg-green-600' 
                  : 'bg-red-600'
              }`}>
                <span className="text-lg">{transactionModal.type === 'income' ? '⬆️' : '⬇️'}</span>
                {transactionModal.type === 'income' ? 'INGRESO' : 'EGRESO'}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {transactionModal.type === 'income' ? 'Agregar Ingreso' : 'Agregar Egreso'}
              </h2>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Monto *
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <span className="px-4 py-3 text-slate-600 font-medium">$</span>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    placeholder="0"
                    className="flex-1 px-3 py-3 border-0 focus:outline-none focus:ring-0 text-lg font-semibold"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                  placeholder={transactionModal.type === 'income' ? 'Ej: Salario' : 'Ej: Supermercado'}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Amount Preview */}
              {transactionAmount && !isNaN(parseFloat(transactionAmount)) && (
                <div className={`mt-4 p-4 rounded-lg ${
                  transactionModal.type === 'income' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="text-sm text-slate-600 mb-1">Monto a registrar:</div>
                  <div className={`text-2xl font-bold ${
                    transactionModal.type === 'income' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transactionModal.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transactionAmount))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setTransactionModal(null);
                  setTransactionAmount('');
                  setTransactionDescription('');
                }}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAddTransaction(transactionModal.type)}
                disabled={loading || !transactionAmount}
                className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors font-medium ${
                  transactionModal.type === 'income'
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
                }`}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800"
        >
          🏠 Home
        </a>
      </div>
    </div>
  );
}
