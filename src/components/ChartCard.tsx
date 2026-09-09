import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, icon: Icon, children, className }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className || ''}`}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}
