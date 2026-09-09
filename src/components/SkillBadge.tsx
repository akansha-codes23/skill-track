import type { SkillLevel } from '@/types';

interface SkillBadgeProps {
  name: string;
  level?: SkillLevel;
  variant?: 'default' | 'acquired' | 'missing' | 'priority';
}

const variantMap = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  acquired: 'bg-green-50 text-green-700 border-green-200',
  missing: 'bg-red-50 text-red-700 border-red-200',
  priority: 'bg-amber-50 text-amber-700 border-amber-200',
};

const levelColor = {
  Beginner: 'text-gray-500',
  Intermediate: 'text-blue-600',
  Advanced: 'text-indigo-600',
};

export default function SkillBadge({ name, level, variant = 'default' }: SkillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${variantMap[variant]}`}
    >
      {name}
      {level && <span className={`text-xs ${levelColor[level]}`}>({level})</span>}
    </span>
  );
}
