import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Building2,
  Briefcase,
  Calendar,
  IndianRupee,
  Save,
} from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { domainService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

import type {
  EmploymentStatus,
  EmploymentType,
} from '@/types';

interface EmploymentRecord {
  id: string;
  user_id: string;
  status: EmploymentStatus;
  company: string | null;
  job_title: string | null;
  employment_type: EmploymentType | null;
  joined_date: string | null;
}

export default function EmploymentTracking() {
  const { user, updateUser } = useAuth();

  const [record, setRecord] =
    useState<EmploymentRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [status, setStatus] =
    useState<EmploymentStatus>(
      user?.employmentStatus || 'Unemployed'
    );

  const [company, setCompany] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>('Full-time');

  const [domainId, setDomainId] = useState(
    user?.domainId || ''
  );

  const domains = domainService.getAll();

  useEffect(() => {
    const loadEmployment = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('employment_records')
        .select('*')
        .eq('user_id', user.id)
        .order('joined_date', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          'Error loading employment record:',
          error
        );
      }

      if (data) {
        const loadedRecord: EmploymentRecord = {
          id: String(data.id),
          user_id: String(data.user_id),
          status:
            data.status as EmploymentStatus,
          company: data.company,
          job_title: data.job_title,
          employment_type:
            data.employment_type as EmploymentType,
          joined_date: data.joined_date,
        };

        setRecord(loadedRecord);

        setStatus(loadedRecord.status);
        setCompany(loadedRecord.company || '');
        setJobRole(loadedRecord.job_title || '');
        setJoiningDate(
          loadedRecord.joined_date || ''
        );
        setEmploymentType(
          loadedRecord.employment_type ||
            'Full-time'
        );
      }

      setLoading(false);
    };

    loadEmployment();
  }, [user?.id]);

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading employment information...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const employmentTypes: EmploymentType[] = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
  ];

  const statuses: EmploymentStatus[] = [
    'Employed',
    'Seeking',
    'Unemployed',
  ];

  const handleSave = async () => {
    const employmentData = {
      user_id: user.id,
      status,
      company:
        status === 'Employed'
          ? company
          : null,
      job_title:
        status === 'Employed'
          ? jobRole
          : null,
      employment_type:
        status === 'Employed'
          ? employmentType
          : null,
      joined_date:
        status === 'Employed'
          ? joiningDate || null
          : null,
    };

    let saveError = null;

    if (record) {
      const { data, error } = await supabase
        .from('employment_records')
        .update(employmentData)
        .eq('id', record.id)
        .select()
        .single();

      saveError = error;

      if (!error && data) {
        setRecord({
          id: String(data.id),
          user_id: String(data.user_id),
          status:
            data.status as EmploymentStatus,
          company: data.company,
          job_title: data.job_title,
          employment_type:
            data.employment_type as EmploymentType,
          joined_date: data.joined_date,
        });
      }
    } else {
      const { data, error } = await supabase
        .from('employment_records')
        .insert({
          id: `er${Date.now()}`,
          ...employmentData,
        })
        .select()
        .single();

      saveError = error;

      if (!error && data) {
        setRecord({
          id: String(data.id),
          user_id: String(data.user_id),
          status:
            data.status as EmploymentStatus,
          company: data.company,
          job_title: data.job_title,
          employment_type:
            data.employment_type as EmploymentType,
          joined_date: data.joined_date,
        });
      }
    }

    if (saveError) {
      console.error(
        'Error saving employment record:',
        saveError
      );
      return;
    }

    updateUser({
      employmentStatus: status,
    });

    const { error: userError } = await supabase
      .from('users')
      .update({
        employment_status: status,
      })
      .eq('id', user.id);

    if (userError) {
      console.error(
        'Error updating user employment status:',
        userError
      );
    }

    setEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          Employment Tracking
        </h2>

        <p className="text-gray-500">
          Update your employment status. This data
          contributes to government analytics.
        </p>
      </div>

      {/* Status Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                status === 'Employed'
                  ? 'bg-green-50'
                  : status === 'Seeking'
                    ? 'bg-amber-50'
                    : 'bg-gray-50'
              }`}
            >
              <TrendingUp
                className={`w-7 h-7 ${
                  status === 'Employed'
                    ? 'text-green-600'
                    : status === 'Seeking'
                      ? 'text-amber-600'
                      : 'text-gray-400'
                }`}
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Current Status
              </p>

              <div className="mt-1">
                <StatusBadge status={status} />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (editing) {
                handleSave();
              } else {
                setEditing(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {editing ? 'Save' : 'Update Status'}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Status
            </label>

            <div className="grid grid-cols-3 gap-3">
              {statuses.map((employmentStatus) => (
                <button
                  key={employmentStatus}
                  onClick={() =>
                    setStatus(employmentStatus)
                  }
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                    status === employmentStatus
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {employmentStatus}
                </button>
              ))}
            </div>
          </div>

          {status === 'Employed' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Company
                  </label>

                  <input
                    type="text"
                    value={company}
                    onChange={(event) =>
                      setCompany(event.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    Job Role
                  </label>

                  <input
                    type="text"
                    value={jobRole}
                    onChange={(event) =>
                      setJobRole(event.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joining Date
                  </label>

                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(event) =>
                      setJoiningDate(
                        event.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    Salary Range
                  </label>

                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(event) =>
                      setSalaryRange(
                        event.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="₹6-10 LPA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type
                  </label>

                  <select
                    value={employmentType}
                    onChange={(event) =>
                      setEmploymentType(
                        event.target.value as EmploymentType
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {employmentTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>

                  <select
                    value={domainId}
                    onChange={(event) =>
                      setDomainId(
                        event.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">
                      Select domain...
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
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {status === 'Employed' && record ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Company
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {record.company || 'Not set'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  Job Role
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {record.job_title || 'Not set'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joining Date
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {record.joined_date || 'Not set'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Salary Range
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {salaryRange || 'Not set'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  Employment Type
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {record.employment_type ||
                    'Not set'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  Domain
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {domains.find(
                    (domain) =>
                      domain.id === domainId
                  )?.name || 'Not set'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />

              <p className="text-gray-500">
                {status === 'Seeking'
                  ? 'You are currently seeking employment. Update your status when you get hired!'
                  : 'You are currently unemployed. Update your status to start tracking.'}
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}