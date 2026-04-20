import AccountsClient from './AccountsClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  userId: string;
}

export default async function AccountsPage() {
  try {
    const response = await fetch(new URL('/api/accounts', baseUrl).toString(), {
      cache: 'no-store'
    });
    
    const { data: accounts } = await response.json();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <AccountsClient accounts={accounts} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error al cargar las cuentas</p>
          </div>
        </div>
      </div>
    );
  }
}
