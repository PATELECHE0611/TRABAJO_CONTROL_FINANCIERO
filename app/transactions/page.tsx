import TransactionClient from './TransactionClient';
import { baseUrl } from '@/lib/api';

export default async function TransactionsPage() {
  const [transactionRes, accountRes, categoryRes] = await Promise.all([
    fetch(new URL('/api/transactions', baseUrl).toString(), { cache: 'no-store' }),
    fetch(new URL('/api/accounts', baseUrl).toString(), { cache: 'no-store' }),
    fetch(new URL('/api/categories', baseUrl).toString(), { cache: 'no-store' })
  ]);

  const [{ data: transactions }, { data: accounts }, { data: categories }] = await Promise.all([
    transactionRes.json(),
    accountRes.json(),
    categoryRes.json()
  ]);

  return <TransactionClient transactions={transactions} accounts={accounts} categories={categories} />;
}
