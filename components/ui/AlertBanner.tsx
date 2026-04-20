interface AlertBannerProps {
  title: string;
  description: string;
  variant?: 'info' | 'warning' | 'danger';
}

const variantStyles = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-900'
};

export default function AlertBanner({ title, description, variant = 'info' }: AlertBannerProps) {
  return (
    <div className={`rounded-[28px] border p-6 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-current/80">{description}</p>
        </div>
        <span className="rounded-full border border-current/10 px-3 py-1 text-xs uppercase tracking-[0.25em]">Revisar</span>
      </div>
    </div>
  );
}
