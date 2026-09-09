import { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import ProgressBar from '@/components/ProgressBar';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface TrainingProgram {
  id: string;
  title: string;
  provider: string;
  duration_weeks: number;
  level: string;
  skills_covered: string[];
}

interface Enrollment {
  id: string;
  user_id: string;
  training_program_id: string;
  enrolled_at: string;
  progress: number;
  status: string;
}

interface EnrollmentWithProgram extends Enrollment {
  program?: TrainingProgram;
}

export default function TrainingProgress() {
  const { user } = useAuth();

  const [enrollments, setEnrollments] = useState<
    EnrollmentWithProgram[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainingData = async () => {
      if (!user) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: enrollmentData, error: enrollmentError } =
        await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .order('enrolled_at', { ascending: false });

      if (enrollmentError) {
        console.error(
          'Error loading enrollments:',
          enrollmentError
        );
        setEnrollments([]);
        setLoading(false);
        return;
      }

      if (!enrollmentData || enrollmentData.length === 0) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      const programIds = enrollmentData.map(
        (enrollment) => enrollment.training_program_id
      );

      const { data: programData, error: programError } =
        await supabase
          .from('training_programs')
          .select('*')
          .in('id', programIds);

      if (programError) {
        console.error(
          'Error loading training programs:',
          programError
        );

        setEnrollments(
          enrollmentData.map((enrollment) => ({
            ...enrollment,
          }))
        );

        setLoading(false);
        return;
      }

      const programs = programData || [];

      const combinedData: EnrollmentWithProgram[] =
        enrollmentData.map((enrollment) => ({
          ...enrollment,
          program: programs.find(
            (program) =>
              String(program.id) ===
              String(enrollment.training_program_id)
          ),
        }));

      setEnrollments(combinedData);
      setLoading(false);
    };

    loadTrainingData();
  }, [user?.id]);

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading your training progress...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completed = enrollments.filter(
    (enrollment) =>
      enrollment.status === 'Completed'
  ).length;

  const inProgress = enrollments.filter(
    (enrollment) =>
      enrollment.status === 'In Progress'
  ).length;

  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (sum, enrollment) =>
              sum + Number(enrollment.progress || 0),
            0
          ) / enrollments.length
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          My Training Progress
        </h2>

        <p className="text-gray-500">
          Track your enrolled courses and completion status.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <p className="text-sm font-medium text-gray-500">
              Average Progress
            </p>
          </div>

          <p className="text-2xl font-bold text-indigo-600">
            {avgProgress}%
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-medium text-gray-500">
              In Progress
            </p>
          </div>

          <p className="text-2xl font-bold text-blue-600">
            {inProgress}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-gray-500">
              Completed
            </p>
          </div>

          <p className="text-2xl font-bold text-green-600">
            {completed}
          </p>
        </div>
      </div>

      {/* Enrolled Courses */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />

          <p className="text-gray-400">
            You haven't enrolled in any courses yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const program = enrollment.program;

            if (!program) return null;

            const enrolledDate = enrollment.enrolled_at
              ? new Date(
                  enrollment.enrolled_at
                ).toLocaleDateString()
              : 'Not available';

            const expectedCompletion = enrollment.enrolled_at
              ? new Date(
                  new Date(
                    enrollment.enrolled_at
                  ).getTime() +
                    program.duration_weeks *
                      7 *
                      24 *
                      60 *
                      60 *
                      1000
                ).toLocaleDateString()
              : 'Not available';

            const progress = Number(
              enrollment.progress || 0
            );

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {program.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {program.provider}
                    </p>
                  </div>

                  <StatusBadge status={enrollment.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Started: {enrolledDate}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    Expected: {expectedCompletion}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="w-4 h-4" />
                    {program.duration_weeks} weeks
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">
                      Progress
                    </span>

                    <span className="font-medium text-gray-700">
                      {progress}%
                    </span>
                  </div>

                  <ProgressBar
                    value={progress}
                    color={
                      progress === 100
                        ? 'green'
                        : 'indigo'
                    }
                    size="lg"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Skills Being Developed
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(program.skills_covered || []).map(
                      (skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}