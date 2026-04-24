import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'green' | 'red' | 'blue' | 'orange';
}

const variantStyles = {
  default: { icon: 'bg-slate-100 text-slate-500', value: 'text-[#0f1d3a]', border: 'border-[#dde5f4]' },
  green:   { icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-600', border: 'border-emerald-200' },
  red:     { icon: 'bg-red-50 text-red-500', value: 'text-red-500', border: 'border-red-200' },
  blue:    { icon: 'bg-blue-50 text-blue-600', value: 'text-blue-700', border: 'border-blue-200' },
  orange:  { icon: 'bg-orange-50 text-orange-500', value: 'text-orange-600', border: 'border-orange-200' },
};

export function SummaryCard({ title, value, icon: Icon, description, variant = 'default' }: SummaryCardProps) {
  const s = variantStyles[variant];
  return (
    <div className={cn('rounded-xl border-2 bg-white p-6 shadow-sm', s.border)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-2">{title}</p>
          <p className={cn('text-[26px] font-bold tracking-tight tabular-nums leading-tight', s.value)}>{value}</p>
          {description && <p className="text-[13px] text-slate-400 mt-1.5">{description}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', s.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
