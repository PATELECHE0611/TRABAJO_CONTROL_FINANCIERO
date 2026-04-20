import Link from 'next/link';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded-full hover:bg-slate-100 p-2 transition-colors" title="Ir al inicio">
            <span className="text-2xl">🏠</span>
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Panel de Control</p>
            <h1 className="text-2xl font-semibold text-slate-900">{title ?? 'Control Financiero'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">🔔 Notificaciones</button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2">
            <div className="h-9 w-9 rounded-full bg-slate-900 text-center leading-9 text-white">U</div>
            <div>
              <p className="text-sm font-medium">Usuario de Prueba</p>
              <p className="text-xs text-slate-500">usuario@ejemplo.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
