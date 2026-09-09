import { useEffect, useMemo, useState } from 'react';
import { Search, Briefcase, MapPin } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import JobCard from '@/components/JobCard';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';

import { useAuth } from '@/hooks/useAuth';
import { domainService, calculateJobMatch } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

import type { JobOpportunity, JobType, UserSkill } from '@/types';

export default function JobOpportunities() {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [selectedJob, setSelectedJob] =
    useState<JobOpportunity | null>(null);

  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [allJobs, setAllJobs] = useState<JobOpportunity[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const domains = domainService.getAll();

  const jobTypes: JobType[] = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Remote',
  ];

  useEffect(() => {
    const loadJobData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      /* -------------------------
         Load user's skills
      ------------------------- */
      const {
        data: skillData,
        error: skillError,
      } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('id');

      if (skillError) {
        console.error(
          'Error loading user skills:',
          skillError
        );
      }

      const mappedSkills: UserSkill[] = (skillData || []).map(
        (skill) => ({
          skillId: String(skill.skill_id),
          skillName: String(skill.skill_name),
          level: skill.level,
        })
      );

      setUserSkills(mappedSkills);

      /* -------------------------
         Load jobs
      ------------------------- */
      const {
        data: jobData,
        error: jobError,
      } = await supabase
        .from('job_opportunities')
        .select('*')
        .order('posted_date', { ascending: false });

      if (jobError) {
        console.error(
          'Error loading jobs:',
          jobError
        );
        setAllJobs([]);
      } else {
        const mappedJobs: JobOpportunity[] = (
          jobData || []
        ).map((job) => ({
          id: String(job.id),
          title: String(job.title),
          company: String(job.company),
          location: String(job.location),
          domainId: String(job.domain_id),
          description: String(job.description || ''),
          requiredSkills: Array.isArray(job.required_skills)
            ? job.required_skills.map((skill: unknown) =>
                String(skill)
              )
            : [],
          jobType: job.job_type as JobType,
          experience: String(job.experience || ''),
          postedDate: String(job.posted_date || ''),
          salaryRange: String(job.salary_range || ''),
        }));

        setAllJobs(mappedJobs);
      }

      /* -------------------------
         Load applications
      ------------------------- */
      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('user_id', user.id);

      if (applicationError) {
        console.error(
          'Error loading applications:',
          applicationError
        );
        setAppliedJobIds([]);
      } else {
        setAppliedJobIds(
          (applicationData || []).map((application) =>
            String(application.job_id)
          )
        );
      }

      setLoading(false);
    };

    loadJobData();
  }, [user?.id]);

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          allJobs.map((job) => job.location)
        )
      ),
    [allJobs]
  );

  const filtered = useMemo(() => {
    return allJobs
      .map((job) => ({
        ...job,
        matchScore: calculateJobMatch(
          userSkills,
          job.requiredSkills
        ),
      }))
      .filter((job) => {
        if (
          search &&
          !job.title
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          !job.company
            .toLowerCase()
            .includes(search.toLowerCase())
        ) {
          return false;
        }

        if (
          domainFilter !== 'all' &&
          job.domainId !== domainFilter
        ) {
          return false;
        }

        if (
          locationFilter !== 'all' &&
          job.location !== locationFilter
        ) {
          return false;
        }

        if (
          typeFilter !== 'all' &&
          job.jobType !== typeFilter
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      );
  }, [
    allJobs,
    userSkills,
    search,
    domainFilter,
    locationFilter,
    typeFilter,
  ]);

  const isApplied = (jobId: string) =>
    appliedJobIds.includes(jobId);

  const handleApply = async (
    job: JobOpportunity
  ) => {
    if (!user || isApplied(job.id)) {
      return;
    }

    const applicationId = `a${Date.now()}`;

    const { error } = await supabase
      .from('job_applications')
      .insert({
        id: applicationId,
        user_id: user.id,
        job_id: job.id,
        status: 'Applied',
        applied_at: new Date().toISOString(),
      });

    if (error) {
      console.error(
        'Error applying for job:',
        error
      );
      return;
    }

    setAppliedJobIds((current) => [
      ...current,
      job.id,
    ]);

    setSelectedJob(null);
  };

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading job opportunities...
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
          <Briefcase className="w-6 h-6 text-indigo-600" />
          Job Opportunities
        </h2>

        <p className="text-gray-500">
          Jobs matched to your skills with match scores.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search jobs..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <select
            value={domainFilter}
            onChange={(event) =>
              setDomainFilter(event.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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

          <select
            value={locationFilter}
            onChange={(event) =>
              setLocationFilter(event.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">
              All Locations
            </option>

            {locations.map((location) => (
              <option
                key={location}
                value={location}
              >
                {location}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">
              All Types
            </option>

            {jobTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            matchScore={job.matchScore}
            onView={() =>
              setSelectedJob(job)
            }
            onApply={() =>
              handleApply(job)
            }
            applied={isApplied(job.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>
            No jobs match your filters.
          </p>
        </div>
      )}

      {/* Job Detail Modal */}
      <Modal
        open={!!selectedJob}
        onClose={() =>
          setSelectedJob(null)
        }
        title={selectedJob?.title || ''}
        size="lg"
      >
        {selectedJob && (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-500">
                  {selectedJob.company}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedJob.location}
                  </span>

                  <span>
                    {selectedJob.jobType}
                  </span>

                  <span>
                    {selectedJob.experience}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-3xl font-bold ${
                    calculateJobMatch(
                      userSkills,
                      selectedJob.requiredSkills
                    ) >= 75
                      ? 'text-green-600'
                      : calculateJobMatch(
                            userSkills,
                            selectedJob.requiredSkills
                          ) >= 50
                        ? 'text-amber-600'
                        : 'text-red-500'
                  }`}
                >
                  {calculateJobMatch(
                    userSkills,
                    selectedJob.requiredSkills
                  )}
                  %
                </div>

                <p className="text-xs text-gray-400">
                  Match Score
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              {selectedJob.description}
            </p>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Required Skills
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedJob.requiredSkills.map(
                  (skill) => {
                    const has =
                      userSkills.some(
                        (userSkill) =>
                          userSkill.skillName ===
                          skill
                      );

                    return (
                      <span
                        key={skill}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          has
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {skill}{' '}
                        {has ? '✓' : '✗'}
                      </span>
                    );
                  }
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">
                  Salary:
                </span>{' '}
                <span className="font-medium text-gray-900">
                  {selectedJob.salaryRange}
                </span>
              </div>

              <div>
                <span className="text-gray-500">
                  Posted:
                </span>{' '}
                <span className="font-medium text-gray-900">
                  {selectedJob.postedDate}
                </span>
              </div>
            </div>

            {isApplied(selectedJob.id) ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 font-medium">
                <StatusBadge status="Applied" />
                You've applied for this job
              </div>
            ) : (
              <button
                onClick={() =>
                  handleApply(selectedJob)
                }
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}