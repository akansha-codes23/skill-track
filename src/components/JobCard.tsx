import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
} from 'lucide-react';

import type { JobOpportunity } from '@/types';

interface JobCardProps {
  job: JobOpportunity;
  matchScore?: number;
  onView: () => void;
  onApply?: () => void;
  applied?: boolean;
}

export default function JobCard({
  job,
  matchScore,
  onView,
  onApply,
  applied,
}: JobCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {job.title}
          </h3>

          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3.5 h-3.5" />
            {job.company}
          </p>
        </div>

        {matchScore !== undefined && (
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                matchScore >= 75
                  ? 'text-green-600'
                  : matchScore >= 50
                    ? 'text-amber-600'
                    : 'text-red-500'
              }`}
            >
              {matchScore}%
            </div>

            <p className="text-xs text-gray-400">
              Match
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {job.location}
        </span>

        <span className="flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5" />
          {job.jobType}
        </span>

        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {job.experience}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.requiredSkills
          .slice(0, 4)
          .map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {skill}
            </span>
          ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-700">
          {job.salaryRange}
        </span>

        <div className="flex gap-2">
          <button
            onClick={onView}
            className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            View Details
          </button>

          {onApply && !applied && (
            <button
              onClick={onApply}
              className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Apply
            </button>
          )}

          {applied && (
            <span className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
              Applied
            </span>
          )}
        </div>
      </div>
    </div>
  );
}