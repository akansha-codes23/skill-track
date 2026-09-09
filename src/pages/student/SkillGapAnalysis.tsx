import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import DashboardLayout from '@/layouts/DashboardLayout';
import ChartCard from '@/components/ChartCard';
import ProgressBar from '@/components/ProgressBar';
import { useAuth } from '@/hooks/useAuth';

import {
  domainService,
  jobRoleService,
  calculateSkillGap,
  trainingService,
} from '@/services/dataService';

import { supabase } from '@/lib/supabase';

import type { SkillLevel, UserSkill } from '@/types';

export default function SkillGapAnalysis() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const domain = user?.domainId
    ? domainService.getById(user.domainId)
    : undefined;

  const jobRole = user?.jobRoleId
    ? jobRoleService.getById(user.jobRoleId)
    : undefined;

  useEffect(() => {
    const loadUserSkills = async () => {
      if (!user) {
        setUserSkills([]);
        setLoadingSkills(false);
        return;
      }

      setLoadingSkills(true);

      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('id');

      if (error) {
        console.error('Error loading user skills:', error);
        setUserSkills([]);
        setLoadingSkills(false);
        return;
      }

      const mappedSkills: UserSkill[] = (data || []).map((skill) => ({
        skillId: String(skill.skill_id),
        skillName: String(skill.skill_name),
        level: skill.level as SkillLevel,
      }));

      setUserSkills(mappedSkills);
      setLoadingSkills(false);
    };

    loadUserSkills();
  }, [user?.id]);

  const skillGap = useMemo(() => {
    if (!jobRole) return null;

    return calculateSkillGap(
      userSkills,
      jobRole.requiredSkills
    );
  }, [jobRole, userSkills]);

  const recommendedTraining = useMemo(() => {
    if (!skillGap || !user?.domainId) return [];

    return trainingService
      .getByDomain(user.domainId)
      .filter((tp) =>
        tp.skillsCovered.some((skill) =>
          skillGap.missing.includes(skill)
        )
      );
  }, [skillGap, user?.domainId]);

  if (!user) return null;

  if (loadingSkills) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading your skills...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!domain || !jobRole || !skillGap) {
    return (
      <DashboardLayout>
        <div className="bg-amber-50 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            Please select a domain and target job role first.
          </p>

          <button
            onClick={() => navigate('/student/domains')}
            className="mt-3 text-indigo-600 font-medium"
          >
            Select Domain
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const pieData = [
    {
      name: 'Acquired',
      value: skillGap.acquired.length,
      color: '#22c55e',
    },
    {
      name: 'Missing',
      value: skillGap.missing.length,
      color: '#ef4444',
    },
  ];

  const levelWeight: Record<string, number> = {
    Beginner: 33,
    Intermediate: 66,
    Advanced: 100,
  };

  const proficiencyData = userSkills
    .filter((userSkill) =>
      jobRole.requiredSkills.includes(userSkill.skillName)
    )
    .map((userSkill) => ({
      name: userSkill.skillName,
      proficiency: levelWeight[userSkill.level] || 0,
      level: userSkill.level,
    }));

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-indigo-600" />
          Skill Gap Analysis
        </h2>

        <p className="text-gray-500">
          Target:{' '}
          <span className="font-medium text-indigo-600">
            {jobRole.title}
          </span>{' '}
          | Domain: {domain.name}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-gray-500">
              Acquired
            </p>
          </div>

          <p className="text-2xl font-bold text-green-600">
            {skillGap.acquired.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium text-gray-500">
              Missing
            </p>
          </div>

          <p className="text-2xl font-bold text-red-600">
            {skillGap.missing.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <p className="text-sm font-medium text-gray-500">
              Gap Percentage
            </p>
          </div>

          <p className="text-2xl font-bold text-amber-600">
            {skillGap.gapPercentage}%
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <p className="text-sm font-medium text-gray-500">
              Total Required
            </p>
          </div>

          <p className="text-2xl font-bold text-indigo-600">
            {jobRole.requiredSkills.length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Skills Overview" icon={GitCompare}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Skill Proficiency" icon={BookOpen}>
          {proficiencyData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No acquired skills yet. Add skills to see proficiency.
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={250}
            >
              <BarChart
                data={proficiencyData}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f0f0f0"
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  width={80}
                />

                <Tooltip />

                <Bar
                  dataKey="proficiency"
                  fill="#4f46e5"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Required Skills vs Your Skills
        </h3>

        <div className="space-y-2">
          {jobRole.requiredSkills.map((skill) => {
            const has = skillGap.acquired.includes(skill);

            const userSkill = userSkills.find(
              (userSkillItem) =>
                userSkillItem.skillName === skill
            );

            return (
              <div
                key={skill}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {has ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}

                  <span className="text-sm font-medium text-gray-700">
                    {skill}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {has && userSkill && (
                    <span className="text-xs text-gray-500">
                      {userSkill.level}
                    </span>
                  )}

                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      has
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {has ? 'Acquired' : 'Missing'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Skills */}
      {skillGap.prioritySkills.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Priority Skills to Learn
          </h3>

          <div className="flex flex-wrap gap-2">
            {skillGap.prioritySkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-white text-amber-700 rounded-full text-sm font-medium border border-amber-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Learning Path */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Recommended Learning Path
          </h3>

          <button
            onClick={() =>
              navigate('/student/training')
            }
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recommendedTraining.length === 0 ? (
          <p className="text-sm text-gray-400">
            No specific training recommendations. You're on track!
          </p>
        ) : (
          <div className="space-y-3">
            {recommendedTraining.map((training, index) => (
              <div
                key={training.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {training.title}
                  </p>

                  <p className="text-xs text-gray-500">
                    {training.provider} | {training.durationWeeks} weeks |{' '}
                    {training.level}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {training.skillsCovered
                      .filter((skill) =>
                        skillGap.missing.includes(skill)
                      )
                      .map((skill) => (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>

                <ProgressBar
                  value={Math.max(0, 100 - index * 20)}
                  color="indigo"
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}