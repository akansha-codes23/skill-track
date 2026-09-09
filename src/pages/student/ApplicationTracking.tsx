import { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  Building2,
  MapPin,
} from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

import type {
  ApplicationStatus,
} from '@/types';

const statuses: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected',
];

const statusColors: Record<string, string> = {
  Applied: 'border-blue-300 bg-blue-50',
  'Under Review': 'border-amber-300 bg-amber-50',
  Shortlisted: 'border-purple-300 bg-purple-50',
  Interview: 'border-indigo-300 bg-indigo-50',
  Selected: 'border-green-300 bg-green-50',
  Rejected: 'border-red-300 bg-red-50',
};

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: ApplicationStatus;
  applied_at: string;
  job?: {
    title: string;
    company: string;
    location: string;
  };
}

export default function ApplicationTracking() {
  const { user } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      if (!user) {
        setApplications([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_at', {
          ascending: false,
        });

      if (applicationError) {
        console.error(
          'Error loading applications:',
          applicationError
        );
        setApplications([]);
        setLoading(false);
        return;
      }

      if (
        !applicationData ||
        applicationData.length === 0
      ) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const jobIds = applicationData.map(
        (application) =>
          application.job_id
      );

      const {
        data: jobData,
        error: jobError,
      } = await supabase
        .from('job_opportunities')
        .select(
          'id, title, company, location'
        )
        .in('id', jobIds);

      if (jobError) {
        console.error(
          'Error loading application jobs:',
          jobError
        );
      }

      const combinedApplications: Application[] =
        applicationData.map(
          (application) => {
            const job = (jobData || []).find(
              (item) =>
                String(item.id) ===
                String(application.job_id)
            );

            return {
              id: String(application.id),
              user_id: String(application.user_id),
              job_id: String(application.job_id),
              status:
                application.status as ApplicationStatus,
              applied_at:
                application.applied_at,
              job: job
                ? {
                    title: String(job.title),
                    company: String(
                      job.company
                    ),
                    location: String(
                      job.location
                    ),
                  }
                : undefined,
            };
          }
        );

      setApplications(
        combinedApplications
      );

      setLoading(false);
    };

    loadApplications();
  }, [user?.id]);

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading your applications...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return 'Not available';
    }

    return new Date(
      dateString
    ).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Application Tracking
        </h2>

        <p className="text-gray-500">
          Track your job applications through
          every stage.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {statuses.map((status) => {
          const count =
            applications.filter(
              (application) =>
                application.status ===
                status
            ).length;

          return (
            <div
              key={status}
              className={`rounded-lg border-2 p-3 text-center ${statusColors[status]}`}
            >
              <p className="text-2xl font-bold">
                {count}
              </p>

              <p className="text-xs text-gray-600 mt-0.5">
                {status}
              </p>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statuses.map((status) => {
          const apps =
            applications.filter(
              (application) =>
                application.status ===
                status
            );

          return (
            <div
              key={status}
              className="bg-gray-50 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  {status}
                </h3>

                <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">
                  {apps.length}
                </span>
              </div>

              <div className="space-y-2">
                {apps.map((application) => (
                  <div
                    key={application.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {application.job?.title ||
                        'Job unavailable'}
                    </p>

                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" />

                      {application.job
                        ?.company ||
                        'Company unavailable'}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />

                        {application.job
                          ?.location ||
                          'Location unavailable'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />

                        {formatDate(
                          application.applied_at
                        )}
                      </span>

                      <StatusBadge
                        status={
                          application.status
                        }
                      />
                    </div>
                  </div>
                ))}

                {apps.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No applications
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table View */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          All Applications
        </h3>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                  Job Title
                </th>

                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                  Company
                </th>

                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                  Location
                </th>

                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                  Applied Date
                </th>

                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {applications.map(
                (application) => (
                  <tr
                    key={application.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {application.job
                        ?.title ||
                        'Job unavailable'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {application.job
                        ?.company ||
                        'Company unavailable'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500">
                      {application.job
                        ?.location ||
                        'Location unavailable'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(
                        application.applied_at
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={
                          application.status
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}