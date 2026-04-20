import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Control Financiero',
  description: 'Panel de control de finanzas personales. Gestiona tus cuentas, transacciones, presupuestos y deudas.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
