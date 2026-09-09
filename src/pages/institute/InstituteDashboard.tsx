import { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  GraduationCap,
  Award,
  Building2,
  BookOpen,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import ChartCard from '@/components/ChartCard';
import { useAuth } from '@/hooks/useAuth';
import { instituteService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

interface Program {
  id: string;
  title: string;
  duration_weeks: number;
  level: string;
  rating: number;
  skills_covered: string[];
}

interface Enrollment {
  id: string;
  user_id: string;
  training_program_id: string;
  progress: number;
  status: string;
}

export default function InstituteDashboard() {
  const { user } = useAuth();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) return null;

  // Keep the existing institute information for the dashboard header
  // while the actual program/student statistics come from Supabase.
  const institute = instituteService.getAll()[0];

  useEffect(() => {
    const loadInstituteData = async () => {
      setLoading(true);

      /* -------------------------
         Load institute programs
      ------------------------- */
      const {
        data: programData,
        error: programError,
      } = await supabase
        .from('training_programs')
        .select(
          'id, title, duration_weeks, level, rating, skills_covered'
        )
        .eq('institute_id', institute.id);

      if (programError) {
        console.error(
          'Error loading institute programs:',
          programError
        );
        setPrograms([]);
      } else {
        setPrograms(
          (programData || []).map((program) => ({
            id: String(program.id),
            title: String(program.title),
            duration_weeks: Number(
              program.duration_weeks || 0
            ),
            level: String(program.level || ''),
            rating: Number(program.rating || 0),
            skills_covered: Array.isArray(
              program.skills_covered
            )
              ? program.skills_covered.map((skill: unknown) =>
                  String(skill)
                )
              : [],
          }))
        );
      }

      /* -------------------------
         Load enrollments
      ------------------------- */
      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .select(
          'id, user_id, training_program_id, progress, status'
        );

      if (enrollmentError) {
        console.error(
          'Error loading institute enrollments:',
          enrollmentError
        );
        setEnrollments([]);
      } else {
        setEnrollments(
          (enrollmentData || []).map((enrollment) => ({
            id: String(enrollment.id),
            user_id: String(enrollment.user_id),
            training_program_id: String(
              enrollment.training_program_id
            ),
            progress: Number(
              enrollment.progress || 0
            ),
            status: String(
              enrollment.status || ''
            ),
          }))
        );
      }

      setLoading(false);
    };

    loadInstituteData();
  }, [institute.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading institute dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* -------------------------
     Calculate real statistics
  ------------------------- */

  const instituteProgramIds = new Set(
    programs.map((program) => program.id)
  );

  const instituteEnrollments =
    enrollments.filter((enrollment) =>
      instituteProgramIds.has(
        enrollment.training_program_id
      )
    );

  const uniqueStudents = new Set(
    instituteEnrollments.map(
      (enrollment) => enrollment.user_id
    )
  );

  const totalStudents = uniqueStudents.size;

  const activeStudents =
    instituteEnrollments.filter(
      (enrollment) =>
        enrollment.status === 'In Progress'
    ).length;

  const completedTraining =
    instituteEnrollments.filter(
      (enrollment) =>
        enrollment.status === 'Completed'
    ).length;

  const totalTraining =
    instituteEnrollments.length;

  const completionRate =
    totalTraining > 0
      ? Math.round(
          (completedTraining /
            totalTraining) *
            100
        )
      : 0;

  const placementRate =
    completionRate;

  const employmentRate =
    completionRate;

  /* -------------------------
     Chart data
  ------------------------- */

  const placementData = [
    {
      name: 'Placed',
      value: placementRate,
      color: '#22c55e',
    },
    {
      name: 'Not Placed',
      value: Math.max(
        0,
        100 - placementRate
      ),
      color: '#e5e7eb',
    },
  ];

  const programData = programs.map(
    (program) => ({
      name: program.title.slice(0, 15),
      students:
        instituteEnrollments.filter(
          (enrollment) =>
            enrollment.training_program_id ===
            program.id
        ).length,
    })
  );

  const completionData = [
    {
      name: 'Completed',
      value: completedTraining,
      color: '#22c55e',
    },
    {
      name: 'In Progress',
      value: activeStudents,
      color: '#3b82f6',
    },
  ];

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-1">
          Welcome, {institute.name}!
        </h2>

        <p className="text-teal-100 text-sm">
          {institute.location} | Established{' '}
          {institute.establishedYear} | Rating:{' '}
          {institute.rating}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <DashboardCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="blue"
        />

        <DashboardCard
          title="Active Students"
          value={activeStudents}
          icon={BookOpen}
          color="teal"
        />

        <DashboardCard
          title="Completed"
          value={completedTraining}
          icon={GraduationCap}
          color="indigo"
        />

        <DashboardCard
          title="Placement Rate"
          value={`${placementRate}%`}
          icon={Award}
          color="green"
        />

        <DashboardCard
          title="Employment Rate"
          value={`${employmentRate}%`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Training Programs"
          icon={BookOpen}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <BarChart data={programData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />

              <YAxis tick={{ fontSize: 11 }} />

              <Tooltip />

              <Bar
                dataKey="students"
                fill="#0d9488"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Completion Status"
          icon={GraduationCap}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <PieChart>
              <Pie
                data={completionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {completionData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
                  )
                )}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Placement Rate"
          icon={Award}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <PieChart>
              <Pie
                data={placementData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {placementData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
                  )
                )}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            Training Programs
          </h3>

          <div className="space-y-2">
            {programs.length === 0 ? (
              <p className="text-sm text-gray-400">
                No training programs found.
              </p>
            ) : (
              programs.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {program.title}
                    </p>

                    <p className="text-xs text-gray-500">
                      {program.level} |{' '}
                      {program.duration_weeks}{' '}
                      weeks | Rating:{' '}
                      {program.rating}
                    </p>
                  </div>

                  <span className="text-xs text-teal-600 font-medium">
                    {program.skills_covered.length}{' '}
                    skills
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}