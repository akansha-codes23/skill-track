import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Check, ArrowRight, Briefcase, BookOpen, Code2 } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { domainService, jobRoleService, trainingService, userService } from '@/services/dataService';
import SkillBadge from '@/components/SkillBadge';

export default function JobRoleSelection() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const domain = user.domainId ? domainService.getById(user.domainId) : undefined;
  const [selectedRole, setSelectedRole] = useState<string | null>(user.jobRoleId || null);

  if (!domain) {
    return (
      <DashboardLayout>
        <div className="bg-amber-50 rounded-xl p-6 text-center">
          <p className="text-gray-700">Please select a domain first.</p>
          <button onClick={() => navigate('/student/domains')} className="mt-3 text-indigo-600 font-medium">Select Domain</button>
        </div>
      </DashboardLayout>
    );
  }

  const roles = jobRoleService.getByDomain(domain.id);

  const handleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    updateUser({ jobRoleId: roleId });
    userService.update(user.id, { jobRoleId: roleId });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Select Your Target Job Role</h2>
        <p className="text-gray-500">Domain: <span className="font-medium text-indigo-600">{domain.name}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map((role) => {
          const selected = selectedRole === role.id;
          const recommended = trainingService.getAll().filter((tp) => role.recommendedTrainingIds.includes(tp.id));
          return (
            <div
              key={role.id}
              onClick={() => handleSelect(role.id)}
              className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                selected ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{role.title}</h3>
                </div>
                {selected && (
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">{role.description}</p>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5" /> Required Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {role.requiredSkills.map((s) => (
                    <SkillBadge key={s} name={s} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Recommended Training
                </p>
                <div className="space-y-1">
                  {recommended.map((tp) => (
                    <div key={tp.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {tp.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedRole && (
        <div className="mt-6 bg-indigo-50 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              Target: {jobRoleService.getById(selectedRole)?.title}
            </p>
            <p className="text-sm text-gray-500">Now add your skills and take an assessment</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/student/skills')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Add Skills <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
