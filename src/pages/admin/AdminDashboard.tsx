import { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  Building2,
  BookOpen,
  Briefcase,
  UserCheck,
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import ChartCard from '@/components/ChartCard';

import { useAuth } from '@/hooks/useAuth';
import { domainService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

interface Student {
  id: string;
  domain_id: string | null;
  training_progress: number;
  employment_status: string;
  skill_gap_percentage: number;
}

interface Institute {
  id: string;
  name: string;
}

interface Program {
  id: string;
  institute_id: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  training_program_id: string;
  progress: number;
  status: string;
  enrolled_at: string;
}

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [institutes, setInstitutes] =
    useState<Institute[]>([]);
  const [programs, setPrograms] =
    useState<Program[]>([]);
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);
  const [applications, setApplications] =
    useState<Application[]>([]);
  const [jobCount, setJobCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const domains = domainService.getAll();

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);

      /* -------------------------
         Students
      ------------------------- */
      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from('users')
        .select(
          'id, domain_id, training_progress, employment_status, skill_gap_percentage'
        )
        .eq('role', 'student');

      if (studentError) {
        console.error(
          'Error loading students:',
          studentError
        );
        setStudents([]);
      } else {
        setStudents(
          (studentData || []).map((student) => ({
            id: String(student.id),
            domain_id: student.domain_id
              ? String(student.domain_id)
              : null,
            training_progress: Number(
              student.training_progress || 0
            ),
            employment_status: String(
              student.employment_status ||
                'Unemployed'
            ),
            skill_gap_percentage: Number(
              student.skill_gap_percentage || 0
            ),
          }))
        );
      }

      /* -------------------------
         Training Institutes
      ------------------------- */
      const {
        data: instituteData,
        error: instituteError,
      } = await supabase
        .from('training_institutes')
        .select('id, name');

      if (instituteError) {
        console.error(
          'Error loading institutes:',
          instituteError
        );
        setInstitutes([]);
      } else {
        setInstitutes(
          (instituteData || []).map(
            (institute) => ({
              id: String(institute.id),
              name: String(
                institute.name || ''
              ),
            })
          )
        );
      }

      /* -------------------------
         Training Programs
      ------------------------- */
      const {
        data: programData,
        error: programError,
      } = await supabase
        .from('training_programs')
        .select('id, institute_id');

      if (programError) {
        console.error(
          'Error loading programs:',
          programError
        );
        setPrograms([]);
      } else {
        setPrograms(
          (programData || []).map(
            (program) => ({
              id: String(program.id),
              institute_id: String(
                program.institute_id
              ),
            })
          )
        );
      }

      /* -------------------------
         Enrollments
      ------------------------- */
      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .select(
          'id, user_id, training_program_id, progress, status, enrolled_at'
        );

      if (enrollmentError) {
        console.error(
          'Error loading enrollments:',
          enrollmentError
        );
        setEnrollments([]);
      } else {
        setEnrollments(
          (enrollmentData || []).map(
            (enrollment) => ({
              id: String(enrollment.id),
              user_id: String(
                enrollment.user_id
              ),
              training_program_id: String(
                enrollment.training_program_id
              ),
              progress: Number(
                enrollment.progress || 0
              ),
              status: String(
                enrollment.status || ''
              ),
              enrolled_at: String(
                enrollment.enrolled_at || ''
              ),
            })
          )
        );
      }

      /* -------------------------
         Job Applications
      ------------------------- */
      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from('job_applications')
        .select(
          'id, user_id, job_id, status, applied_at'
        );

      if (applicationError) {
        console.error(
          'Error loading applications:',
          applicationError
        );
        setApplications([]);
      } else {
        setApplications(
          (applicationData || []).map(
            (application) => ({
              id: String(application.id),
              user_id: String(
                application.user_id
              ),
              job_id: String(
                application.job_id
              ),
              status: String(
                application.status || ''
              ),
              applied_at: String(
                application.applied_at || ''
              ),
            })
          )
        );
      }

      /* -------------------------
         Jobs
      ------------------------- */
      const {
        count,
        error: jobError,
      } = await supabase
        .from('job_opportunities')
        .select('*', {
          count: 'exact',
          head: true,
        });

      if (jobError) {
        console.error(
          'Error loading job count:',
          jobError
        );
        setJobCount(0);
      } else {
        setJobCount(count || 0);
      }

      setLoading(false);
    };

    loadAdminData();
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* -------------------------
     Summary statistics
  ------------------------- */

  const trained = students.filter(
    (student) =>
      student.training_progress > 0
  ).length;

  const completed = students.filter(
    (student) =>
      student.training_progress >= 100
  ).length;

  const employed = students.filter(
    (student) =>
      student.employment_status ===
      'Employed'
  ).length;

  const seeking = students.filter(
    (student) =>
      student.employment_status ===
      'Seeking'
  ).length;

  const unemployed = students.filter(
    (student) =>
      student.employment_status ===
      'Unemployed'
  ).length;

  const completionRate =
    students.length > 0
      ? Math.round(
          (completed / students.length) * 100
        )
      : 0;

  const employmentRate =
    students.length > 0
      ? Math.round(
          (employed / students.length) * 100
        )
      : 0;

  /* -------------------------
     Training Enrollment Trend
  ------------------------- */

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const currentYear =
    new Date().getFullYear();

  const enrollmentTrend = months.map(
    (month, index) => {
      const count =
        enrollments.filter(
          (enrollment) => {
            if (!enrollment.enrolled_at) {
              return false;
            }

            const date = new Date(
              enrollment.enrolled_at
            );

            return (
              date.getFullYear() ===
                currentYear &&
              date.getMonth() === index
            );
          }
        ).length;

      return {
        month,
        enrollments: count,
      };
    }
  );

  /* -------------------------
     Domain-wise Skill Gaps
  ------------------------- */

  const domainGaps = domains.map(
    (domain) => {
      const domainStudents =
        students.filter(
          (student) =>
            student.domain_id ===
            domain.id
        );

      const averageGap =
        domainStudents.length > 0
          ? Math.round(
              domainStudents.reduce(
                (sum, student) =>
                  sum +
                  student.skill_gap_percentage,
                0
              ) /
                domainStudents.length
            )
          : 0;

      return {
        name: domain.name.slice(0, 10),
        gap: averageGap,
      };
    }
  );

  /* -------------------------
     Institute Performance
  ------------------------- */

  const institutePerf =
    institutes.map((institute) => {
      const instituteProgramIds =
        programs
          .filter(
            (program) =>
              program.institute_id ===
              institute.id
          )
          .map(
            (program) => program.id
          );

      const instituteEnrollments =
        enrollments.filter(
          (enrollment) =>
            instituteProgramIds.includes(
              enrollment.training_program_id
            )
        );

      const instituteStudentIds =
        new Set(
          instituteEnrollments.map(
            (enrollment) =>
              enrollment.user_id
          )
        );

      const instituteStudents =
        students.filter((student) =>
          instituteStudentIds.has(
            student.id
          )
        );

      const instituteEmployed =
        instituteStudents.filter(
          (student) =>
            student.employment_status ===
            'Employed'
        ).length;

      const instituteCompleted =
        instituteEnrollments.filter(
          (enrollment) =>
            enrollment.status ===
            'Completed'
        ).length;

      const placement =
        instituteStudents.length > 0
          ? Math.round(
              (instituteEmployed /
                instituteStudents.length) *
                100
            )
          : 0;

      const employment =
        instituteStudents.length > 0
          ? Math.round(
              (instituteEmployed /
                instituteStudents.length) *
                100
            )
          : 0;

      void instituteCompleted;

      return {
        name: institute.name.slice(
          0,
          12
        ),
        placement,
        employment,
      };
    });

  /* -------------------------
     Employment Outcomes
  ------------------------- */

  const employmentData = [
    {
      name: 'Employed',
      value: employed,
      color: '#22c55e',
    },
    {
      name: 'Seeking',
      value: seeking,
      color: '#f59e0b',
    },
    {
      name: 'Unemployed',
      value: unemployed,
      color: '#9ca3af',
    },
  ];

  /* -------------------------
     Job Placement Trends
  ------------------------- */

  const placementTrend = months.map(
    (month, index) => {
      const placements =
        applications.filter(
          (application) => {
            if (
              application.status !==
              'Selected'
            ) {
              return false;
            }

            if (!application.applied_at) {
              return false;
            }

            const date = new Date(
              application.applied_at
            );

            return (
              date.getFullYear() ===
                currentYear &&
              date.getMonth() === index
            );
          }
        ).length;

      return {
        month,
        placements,
      };
    }
  );

  /* -------------------------
     Training Completion Data
  ------------------------- */

  const notStarted =
    students.filter(
      (student) =>
        student.training_progress <= 0
    ).length;

  const inProgress =
    students.filter(
      (student) =>
        student.training_progress > 0 &&
        student.training_progress < 100
    ).length;

  const completionData = [
    {
      name: 'Completed',
      value: completed,
      fill: '#22c55e',
    },
    {
      name: 'In Progress',
      value: inProgress,
      fill: '#3b82f6',
    },
    {
      name: 'Not Started',
      value: notStarted,
      fill: '#e5e7eb',
    },
  ];

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-1">
          Admin / Government Dashboard
        </h2>

        <p className="text-indigo-100 text-sm">
          SIH26135 — Skill Development &
          Employment Tracking Platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <DashboardCard
          title="Registered"
          value={students.length}
          icon={Users}
          color="blue"
        />

        <DashboardCard
          title="Trained"
          value={trained}
          icon={GraduationCap}
          color="teal"
        />

        <DashboardCard
          title="Completion"
          value={`${completionRate}%`}
          icon={Award}
          color="green"
        />

        <DashboardCard
          title="Employment"
          value={`${employmentRate}%`}
          icon={TrendingUp}
          color="indigo"
        />

        <DashboardCard
          title="Unemployed"
          value={unemployed}
          icon={UserCheck}
          color="red"
        />

        <DashboardCard
          title="Institutes"
          value={institutes.length}
          icon={Building2}
          color="amber"
        />

        <DashboardCard
          title="Programs"
          value={programs.length}
          icon={BookOpen}
          color="blue"
        />
      </div>

      {/* Additional Jobs Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-indigo-600" />

          <p className="text-sm text-gray-500">
            Available Job Opportunities
          </p>

          <p className="text-xl font-bold text-gray-900">
            {jobCount}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Training Enrollment Over Time"
          icon={TrendingUp}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <AreaChart
              data={enrollmentTrend}
            >
              <defs>
                <linearGradient
                  id="colorEnroll"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#4f46e5"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="95%"
                    stopColor="#4f46e5"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="enrollments"
                stroke="#4f46e5"
                fillOpacity={1}
                fill="url(#colorEnroll)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Employment Outcomes"
          icon={Briefcase}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <PieChart>
              <Pie
                data={employmentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {employmentData.map(
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Domain-wise Skill Gaps"
          icon={BookOpen}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <BarChart
              data={domainGaps}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 9 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />

              <YAxis
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Bar
                dataKey="gap"
                fill="#ef4444"
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
          title="Institute-wise Performance"
          icon={Building2}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <BarChart
              data={institutePerf}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 9 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
              />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="placement"
                fill="#4f46e5"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
              />

              <Bar
                dataKey="employment"
                fill="#22c55e"
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
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Job Placement Trends"
          icon={Award}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <LineChart
              data={placementTrend}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="placements"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Training Completion Rate"
          icon={GraduationCap}
        >
          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <BarChart
              data={completionData}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Bar
                dataKey="value"
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
      </div>
    </DashboardLayout>
  );
}