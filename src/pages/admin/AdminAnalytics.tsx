import { useState, useMemo } from 'react';
import { BarChart3, Filter } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadialBarChart, RadialBar,
} from 'recharts';
import DashboardLayout from '@/layouts/DashboardLayout';
import ChartCard from '@/components/ChartCard';
import DashboardCard from '@/components/DashboardCard';
import { useAuth } from '@/hooks/useAuth';
import {
  userService, instituteService, domainService, trainingService,
} from '@/services/dataService';

export default function AdminAnalytics() {
  const { user } = useAuth();
  if (!user) return null;

  const students = userService.getStudents();
  const institutes = instituteService.getAll();
  const domains = domainService.getAll();
  const programs = trainingService.getAll();

  const [stateFilter, setStateFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [instituteFilter, setInstituteFilter] = useState('all');
  const [empFilter, setEmpFilter] = useState('all');

  const states = Array.from(new Set(students.map((s) => s.state).filter(Boolean)));

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (stateFilter !== 'all' && s.state !== stateFilter) return false;
      if (domainFilter !== 'all' && s.domainId !== domainFilter) return false;
      if (empFilter !== 'all' && s.employmentStatus !== empFilter) return false;
      return true;
    });
  }, [students, stateFilter, domainFilter, empFilter]);

  const employed = filteredStudents.filter((s) => s.employmentStatus === 'Employed').length;
  const seeking = filteredStudents.filter((s) => s.employmentStatus === 'Seeking').length;
  const unemployed = filteredStudents.filter((s) => s.employmentStatus === 'Unemployed').length;
  const avgGap = filteredStudents.length > 0
    ? Math.round(filteredStudents.reduce((sum, s) => sum + s.skillGapPercentage, 0) / filteredStudents.length)
    : 0;

  const employmentData = [
    { name: 'Employed', value: employed, color: '#22c55e' },
    { name: 'Seeking', value: seeking, color: '#f59e0b' },
    { name: 'Unemployed', value: unemployed, color: '#9ca3af' },
  ];

  const domainGapData = domains.map((d) => {
    const ds = filteredStudents.filter((s) => s.domainId === d.id);
    return {
      name: d.name.slice(0, 10),
      gap: ds.length > 0 ? Math.round(ds.reduce((sum, s) => sum + s.skillGapPercentage, 0) / ds.length) : 0,
      students: ds.length,
    };
  });

  const institutePerf = institutes.map((i) => ({
    name: i.name.slice(0, 12),
    placement: i.placementRate,
    employment: i.employmentRate,
    students: i.totalStudents,
  }));

  const stateData = states.map((st) => {
    const ss = filteredStudents.filter((s) => s.state === st);
    return {
      name: st,
      employed: ss.filter((s) => s.employmentStatus === 'Employed').length,
      total: ss.length,
    };
  });

  const trendData = [
    { month: 'Jan', enrollments: 45, placements: 12 },
    { month: 'Feb', enrollments: 62, placements: 18 },
    { month: 'Mar', enrollments: 78, placements: 25 },
    { month: 'Apr', enrollments: 95, placements: 30 },
    { month: 'May', enrollments: 110, placements: 38 },
    { month: 'Jun', enrollments: 135, placements: 45 },
    { month: 'Jul', enrollments: 150, placements: 52 },
    { month: 'Aug', enrollments: 168, placements: 61 },
  ];

  const skillScoreData = [{ name: 'Score', value: avgGap, fill: '#4f46e5' }];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Analytics & Insights
        </h2>
        <p className="text-gray-500">Deep dive into skilling impact and employment outcomes.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All States</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Domains</option>
            {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={instituteFilter} onChange={(e) => setInstituteFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Institutes</option>
            {institutes.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Employment</option>
            <option value="Employed">Employed</option>
            <option value="Seeking">Seeking</option>
            <option value="Unemployed">Unemployed</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Filtered Students" value={filteredStudents.length} icon={BarChart3} color="blue" />
        <DashboardCard title="Employed" value={employed} icon={BarChart3} color="green" />
        <DashboardCard title="Avg Skill Gap" value={`${avgGap}%`} icon={BarChart3} color="red" />
        <DashboardCard title="Institutes" value={institutes.length} icon={BarChart3} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Enrollment & Placement Trends" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enrollments" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="placements" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Employment Outcomes" icon={BarChart3}>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Domain-wise Skill Gaps" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={domainGapData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="gap" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Institute Performance" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={institutePerf}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="placement" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="employment" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="State-wise Employment" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stateData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="employed" fill="#22c55e" radius={[0, 4, 4, 0]} />
              <Bar dataKey="total" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Skill Gap" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart innerRadius="40%" outerRadius="90%" data={skillScoreData} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={10} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-700" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                {avgGap}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
