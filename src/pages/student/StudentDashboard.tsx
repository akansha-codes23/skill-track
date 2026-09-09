import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  GitCompare,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import ChartCard from '@/components/ChartCard';
import ProgressBar from '@/components/ProgressBar';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import {
  domainService, jobRoleService, userSkillService, applicationService,
  enrollmentService, trainingService, jobService, calculateSkillGap,
} from '@/services/dataService';

export default function StudentDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const domain = user.domainId ? domainService.getById(user.domainId) : undefined;
  const jobRole = user.jobRoleId ? jobRoleService.getById(user.jobRoleId) : undefined;
  const userSkills = userSkillService.getByUserId(user.id);
  const applications = applicationService.getByUserId(user.id);
  const userEnrollments = enrollmentService.getByUserId(user.id);

  const skillGap = useMemo(() => {
    if (!jobRole) return { acquired: [], missing: [], gapPercentage: 0, prioritySkills: [] };
    return calculateSkillGap(userSkills, jobRole.requiredSkills);
  }, [jobRole, userSkills]);

  const recommendedJobs = useMemo(() => {
    return jobService.getAll()
      .filter((j) => j.domainId === user.domainId)
      .map((j) => ({
        ...j,
        matchScore: Math.round(
          (j.requiredSkills.filter((s) => userSkills.some((us) => us.skillName === s)).length /
            j.requiredSkills.length) * 100
        ),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }, [user.domainId, userSkills]);

  const recommendedTraining = useMemo(() => {
    if (!skillGap.missing.length) return [];
    return trainingService.getAll()
      .filter((tp) => tp.domainId === user.domainId)
      .filter((tp) => tp.skillsCovered.some((s) => skillGap.missing.includes(s)))
      .slice(0, 3);
  }, [user.domainId, skillGap.missing]);

  // Chart data
  const skillData = [
    { name: 'Acquired', value: skillGap.acquired.length, color: '#22c55e' },
    { name: 'Missing', value: skillGap.missing.length, color: '#ef4444' },
  ];

  const trainingData = userEnrollments.map((e) => ({
    name: trainingService.getById(e.trainingProgramId)?.title.slice(0, 20) || 'Course',
    progress: e.progress,
  }));

  const appStatusData = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map((status) => ({
    name: status,
    count: applications.filter((a) => a.status === status).length,
  }));

  const profileScore = user.profileCompletion;
  const skillScoreData = [{ name: 'Score', value: user.skillScore, fill: '#4f46e5' }];

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Welcome back, {user.name}!</h2>
        <p className="text-indigo-100 text-sm">
          {domain ? `Domain: ${domain.name}` : 'Select a domain to get started'} {jobRole ? ` | Target: ${jobRole.title}` : ''}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span>Profile Completion</span>
              <span>{profileScore}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${profileScore}%` }} />
            </div>
          </div>
          <Link to="/student/profile" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            Complete Profile
          </Link>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <DashboardCard title="Skills" value={userSkills.length} icon={Code2} color="blue" subtitle={`${skillGap.acquired.length} acquired`} />
        <DashboardCard title="Skill Gap" value={`${user.skillGapPercentage}%`} icon={GitCompare} color="red" subtitle={`${skillGap.missing.length} missing`} />
        <DashboardCard title="Training" value={userEnrollments.length} icon={GraduationCap} color="teal" subtitle={`${userEnrollments.filter(e => e.status === 'In Progress').length} active`} />
        <DashboardCard title="Applications" value={applications.length} icon={Briefcase} color="amber" subtitle={`${applications.filter(a => a.status === 'Interview').length} in interview`} />
        <DashboardCard title="Employment" value={user.employmentStatus} icon={TrendingUp} color={user.employmentStatus === 'Employed' ? 'green' : 'indigo'} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Skill Progress" icon={Code2}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={skillData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {skillData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Skill Score" icon={Target}>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart innerRadius="40%" outerRadius="90%" data={skillScoreData} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={10} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-700" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                {user.skillScore}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Application Status" icon={Briefcase}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={appStatusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Training Progress Chart */}
      {trainingData.length > 0 && (
        <div className="mb-6">
          <ChartCard title="Training Completion" icon={GraduationCap}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trainingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="progress" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Recommended Courses + Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recommended Courses</h3>
            <Link to="/student/training" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recommendedTraining.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 bg-gray-50 rounded-lg">No recommendations yet. Complete an assessment first.</p>
            ) : (
              recommendedTraining.map((tp) => (
                <div key={tp.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <p className="font-medium text-gray-900 text-sm">{tp.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tp.provider} | {tp.durationWeeks} weeks | {tp.level}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tp.skillsCovered.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Job Recommendations</h3>
            <Link to="/student/jobs" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recommendedJobs.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 bg-gray-50 rounded-lg">No jobs available for your domain yet.</p>
            ) : (
              recommendedJobs.map((job) => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{job.company} | <MapPin className="w-3 h-3 inline" /> {job.location}</p>
                    </div>
                    <span className={`text-sm font-bold ${job.matchScore >= 75 ? 'text-green-600' : job.matchScore >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {job.matchScore}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Applications</h3>
          <Link to="/student/applications" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Job Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Company</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Location</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 5).map((app) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{app.jobTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{app.company}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{app.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{app.appliedDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
