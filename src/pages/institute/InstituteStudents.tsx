import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
} from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';

import { useAuth } from '@/hooks/useAuth';
import { domainService, instituteService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

import type { EmploymentStatus } from '@/types';

interface Student {
  id: string;
  name: string;
  email: string;
  domainId?: string;
  district?: string;
  state?: string;
  trainingProgress: number;
  employmentStatus: EmploymentStatus;
}

interface Enrollment {
  id: string;
  user_id: string;
  training_program_id: string;
  progress: number;
  status: string;
}

export default function InstituteStudents() {
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');

  const institute = instituteService.getAll()[0];
  const domains = domainService.getAll();

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);

      /* -------------------------
         Get this institute's programs
      ------------------------- */
      const {
        data: programData,
        error: programError,
      } = await supabase
        .from('training_programs')
        .select('id')
        .eq('institute_id', institute.id);

      if (programError) {
        console.error(
          'Error loading institute programs:',
          programError
        );

        setStudents([]);
        setLoading(false);
        return;
      }

      const programIds = (programData || []).map(
        (program) => String(program.id)
      );

      if (programIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      /* -------------------------
         Get enrollments for these programs
      ------------------------- */
      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .select(
          'id, user_id, training_program_id, progress, status'
        )
        .in('training_program_id', programIds);

      if (enrollmentError) {
        console.error(
          'Error loading student enrollments:',
          enrollmentError
        );

        setStudents([]);
        setLoading(false);
        return;
      }

      if (
        !enrollmentData ||
        enrollmentData.length === 0
      ) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const mappedEnrollments: Enrollment[] =
        enrollmentData.map((enrollment) => ({
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
        }));

      const studentIds = Array.from(
        new Set(
          mappedEnrollments.map(
            (enrollment) =>
              enrollment.user_id
          )
        )
      );

      /* -------------------------
         Get student profiles
      ------------------------- */
      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from('users')
        .select(
          'id, name, email, role, domain_id, district, state, training_progress, employment_status'
        )
        .in('id', studentIds)
        .eq('role', 'student');

      if (studentError) {
        console.error(
          'Error loading students:',
          studentError
        );

        setStudents([]);
        setLoading(false);
        return;
      }

      /* -------------------------
         Build student list
      ------------------------- */
      const mappedStudents: Student[] = (
        studentData || []
      ).map((student) => {
        const studentEnrollments =
          mappedEnrollments.filter(
            (enrollment) =>
              enrollment.user_id ===
              String(student.id)
          );

        const avgProgress =
          studentEnrollments.length > 0
            ? Math.round(
                studentEnrollments.reduce(
                  (sum, enrollment) =>
                    sum +
                    enrollment.progress,
                  0
                ) /
                  studentEnrollments.length
              )
            : Number(
                student.training_progress || 0
              );

        return {
          id: String(student.id),
          name: String(
            student.name || 'Unknown Student'
          ),
          email: String(
            student.email || ''
          ),
          domainId: student.domain_id
            ? String(student.domain_id)
            : undefined,
          district: student.district
            ? String(student.district)
            : '',
          state: student.state
            ? String(student.state)
            : '',
          trainingProgress: avgProgress,
          employmentStatus:
            student.employment_status as EmploymentStatus,
        };
      });

      setStudents(mappedStudents);
      setLoading(false);
    };

    loadStudents();
  }, [institute.id]);

  const filtered = useMemo(() => {
    return students.filter((student) => {
      if (
        search &&
        !student.name
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        !student.email
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }

      if (
        domainFilter !== 'all' &&
        student.domainId !== domainFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    students,
    search,
    domainFilter,
  ]);

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading enrolled students...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-600" />
          Enrolled Students
        </h2>

        <p className="text-gray-500">
          View and track student progress and outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search students..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <select
          value={domainFilter}
          onChange={(event) =>
            setDomainFilter(event.target.value)
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
        >
          <option value="all">
            All Domains
          </option>

          {domains.map((domain) => (
            <option
              key={domain.id}
              value={domain.id}
            >
              {domain.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                Student
              </th>

              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                Domain
              </th>

              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                Location
              </th>

              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                Training Progress
              </th>

              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                Employment
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((student) => (
              <tr
                key={student.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                      {student.name.charAt(0)}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {student.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {domainService.getById(
                    student.domainId || ''
                  )?.name || '-'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-500">
                  {student.district ||
                  student.state
                    ? `${student.district || ''}${
                        student.district &&
                        student.state
                          ? ', '
                          : ''
                      }${student.state || ''}`
                    : '-'}
                </td>

                <td className="px-4 py-3">
                  <div className="w-32">
                    <ProgressBar
                      value={
                        student.trainingProgress
                      }
                      color="teal"
                      size="sm"
                      showLabel
                    />
                  </div>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge
                    status={
                      student.employmentStatus
                    }
                  />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-gray-400"
                >
                  No enrolled students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}