import { Clock, Star, BookOpen, CheckCircle2, Plus } from 'lucide-react';
import type { TrainingProgram, Enrollment } from '@/types';

interface TrainingCardProps {
  program: TrainingProgram;
  enrollment?: Enrollment;
  onEnroll?: () => void;
  enrolled?: boolean;
}

export default function TrainingCard({ program, enrollment, onEnroll, enrolled }: TrainingCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{program.title}</h3>
        <span className="flex items-center gap-1 text-sm text-amber-500">
          <Star className="w-4 h-4 fill-amber-400" /> {program.rating}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-3">{program.provider}</p>
      <p className="text-sm text-gray-600 mb-3">{program.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {program.skillsCovered.slice(0, 4).map((s) => (
          <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">
            {s}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {program.durationWeeks} weeks
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" /> {program.level}
        </span>
      </div>

      {enrollment && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{enrollment.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        {enrolled || enrollment ? (
          <span className="flex items-center gap-1 text-sm font-medium text-green-600">
            <CheckCircle2 className="w-4 h-4" /> Enrolled
          </span>
        ) : (
          <>
            <span className="text-sm text-gray-400">Not enrolled</span>
            {onEnroll && (
              <button
                onClick={onEnroll}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Enroll
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
