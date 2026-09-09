import type { ApplicationStatus, EmploymentStatus, EnrollmentStatus } from '@/types';

type StatusType = ApplicationStatus | EmploymentStatus | EnrollmentStatus | string;

interface StatusBadgeProps {
  status: StatusType;
}

const statusMap: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-amber-100 text-amber-700',
  Shortlisted: 'bg-purple-100 text-purple-700',
  Interview: 'bg-indigo-100 text-indigo-700',
  Selected: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Employed: 'bg-green-100 text-green-700',
  Seeking: 'bg-amber-100 text-amber-700',
  Unemployed: 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  'Not Started': 'bg-gray-100 text-gray-700',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cls = statusMap[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
