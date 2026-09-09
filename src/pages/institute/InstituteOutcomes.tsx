import { Award, TrendingUp, Users, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import ChartCard from '@/components/ChartCard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { userService, domainService } from '@/services/dataService';

export default function InstituteOutcomes() {
  const { user } = useAuth();
  if (!user) return null;

  const students = userService.getStudents();
  const domains = domainService.getAll();

  const employed = students.filter((s) => s.employmentStatus === 'Employed').length;
  const seeking = students.filter((s) => s.employmentStatus === 'Seeking').length;
  const unemployed = students.filter((s) => s.employmentStatus === 'Unemployed').length;

  const employmentData = [
    { name: 'Employed', value: employed, color: '#22c55e' },
    { name: 'Seeking', value: seeking, color: '#f59e0b' },
    { name: 'Unemployed', value: unemployed, color: '#9ca3af' },
  ];

  const domainOutcomes = domains.map((d) => {
    const domainStudents = students.filter((s) => s.domainId === d.id);
    const employedCount = domainStudents.filter((s) => s.employmentStatus === 'Employed').length;
    return {
      name: d.name.slice(0, 12),
      employed: employedCount,
      total: domainStudents.length,
    };
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Award className="w-6 h-6 text-teal-600" /> Outcomes & Placements
        </h2>
        <p className="text-gray-500">Track placement and employment outcomes for your students.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Total Students" value={students.length} icon={Users} color="blue" />
        <DashboardCard title="Employed" value={employed} icon={Briefcase} color="green" />
        <DashboardCard title="Seeking" value={seeking} icon={TrendingUp} color="amber" />
        <DashboardCard title="Placement Rate" value={`${Math.round((employed / students.length) * 100)}%`} icon={Award} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Employment Outcomes" icon={Briefcase}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={employmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {employmentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Domain-wise Placements" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={domainOutcomes}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="employed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Domain</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Training</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Employment</th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 15).map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{s.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{domainService.getById(s.domainId || '')?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.trainingProgress}%</td>
                <td className="px-4 py-3"><StatusBadge status={s.employmentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
