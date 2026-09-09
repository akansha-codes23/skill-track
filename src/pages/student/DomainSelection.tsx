import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, BarChart3, BrainCircuit, ShieldCheck, Cloud, GitBranch,
  Palette, Smartphone, ArrowRight, Check, Users, Briefcase,
} from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { domainService, jobRoleService, trainingService, userService } from '@/services/dataService';

const iconMap: Record<string, typeof Globe> = {
  Globe, BarChart3, BrainCircuit, ShieldCheck, Cloud, GitBranch, Palette, Smartphone,
};

export default function DomainSelection() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const [selectedDomain, setSelectedDomain] = useState<string | null>(user.domainId || null);

  const domains = domainService.getAll();

  const handleSelect = (domainId: string) => {
    setSelectedDomain(domainId);
    updateUser({ domainId });
    userService.update(user.id, { domainId });
  };

  const handleContinue = () => {
    if (selectedDomain) navigate('/student/domains/job-roles');
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Select Your Domain</h2>
        <p className="text-gray-500">Choose a skill domain to see relevant skills, job roles, and training programs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {domains.map((domain) => {
          const Icon = iconMap[domain.icon] || Globe;
          const selected = selectedDomain === domain.id;
          const roles = jobRoleService.getByDomain(domain.id);
          const programs = trainingService.getByDomain(domain.id);
          return (
            <div
              key={domain.id}
              onClick={() => handleSelect(domain.id)}
              className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                selected ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${selected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {selected && (
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{domain.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{domain.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {domain.skills.slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{s}</span>
                ))}
                {domain.skills.length > 4 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+{domain.skills.length - 4}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {roles.length} roles</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {programs.length} programs</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDomain && (
        <div className="bg-indigo-50 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              Selected: {domainService.getById(selectedDomain)?.name}
            </p>
            <p className="text-sm text-gray-500">Continue to select your target job role</p>
          </div>
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Select Job Role <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
