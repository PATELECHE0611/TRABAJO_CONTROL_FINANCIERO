import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="lg:pl-72">
        <Topbar title={title} />
        <main className="min-h-screen px-6 py-6">{children}</main>
      </div>
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
