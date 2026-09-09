import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TrainingCard from '@/components/TrainingCard';
import { useAuth } from '@/hooks/useAuth';
import { trainingService, domainService, userSkillService, enrollmentService, calculateSkillGap, jobRoleService } from '@/services/dataService';
import type { CourseLevel } from '@/types';

export default function TrainingRecommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  const userSkills = userSkillService.getByUserId(user.id);
  const jobRole = user.jobRoleId ? jobRoleService.getById(user.jobRoleId) : undefined;
  const skillGap = jobRole ? calculateSkillGap(userSkills, jobRole.requiredSkills) : null;
  const userEnrollments = enrollmentService.getByUserId(user.id);

  const allPrograms = trainingService.getAll();
  const domains = domainService.getAll();
  const allSkills = Array.from(new Set(allPrograms.flatMap((p) => p.skillsCovered))).sort();

  const filtered = useMemo(() => {
    return allPrograms.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.provider.toLowerCase().includes(search.toLowerCase())) return false;
      if (domainFilter !== 'all' && p.domainId !== domainFilter) return false;
      if (levelFilter !== 'all' && p.level !== levelFilter) return false;
      if (skillFilter !== 'all' && !p.skillsCovered.includes(skillFilter)) return false;
      return true;
    });
  }, [allPrograms, search, domainFilter, levelFilter, skillFilter]);

  const isEnrolled = (programId: string) => userEnrollments.some((e) => e.trainingProgramId === programId);

  const handleEnroll = (programId: string) => {
    enrollmentService.enroll({
      id: `e${Date.now()}`,
      userId: user.id,
      trainingProgramId: programId,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      expectedCompletionDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      skillsDeveloped: trainingService.getById(programId)?.skillsCovered || [],
    });
    navigate('/student/training-progress');
  };

  const recommendedFirst = useMemo(() => {
    if (!skillGap) return filtered;
    const recommended = filtered.filter((p) => p.skillsCovered.some((s) => skillGap.missing.includes(s)));
    const rest = filtered.filter((p) => !recommended.includes(p));
    return [...recommended, ...rest];
  }, [filtered, skillGap]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600" /> Training Recommendations
        </h2>
        <p className="text-gray-500">Recommended courses based on your skill gaps and selected domain.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Domains</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as CourseLevel | 'all')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Skills</option>
            {allSkills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedFirst.map((program) => (
          <TrainingCard
            key={program.id}
            program={program}
            enrollment={isEnrolled(program.id) ? userEnrollments.find((e) => e.trainingProgramId === program.id) : undefined}
            enrolled={isEnrolled(program.id)}
            onEnroll={() => handleEnroll(program.id)}
          />
        ))}
      </div>

      {recommendedFirst.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No training programs match your filters.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
