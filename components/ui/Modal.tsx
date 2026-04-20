'use client';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">Cerrar</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
