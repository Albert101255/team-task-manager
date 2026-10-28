import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  variant?: 'default' | 'warning' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtitle,
  variant = 'default',
}) => {
  const iconColor = {
    default: 'text-slate-600 bg-slate-100',
    warning: 'text-amber-700 bg-amber-50',
    success: 'text-emerald-700 bg-emerald-50',
  }[variant];

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
