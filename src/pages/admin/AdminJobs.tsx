import { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { jobService, domainService } from '@/services/dataService';
import type { JobOpportunity, JobType } from '@/types';

export default function AdminJobs() {
  const [jobs, setJobs] = useState<JobOpportunity[]>(jobService.getAll());
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobOpportunity | null>(null);
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', jobType: 'Full-time' as JobType,
    domainId: 'd1', requiredSkills: '', experience: '', salaryRange: '', description: '',
  });

  const domains = domainService.getAll();
  const filtered = jobs.filter((j) => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (domainFilter !== 'all' && j.domainId !== domainFilter) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', company: '', location: '', jobType: 'Full-time', domainId: 'd1', requiredSkills: '', experience: '', salaryRange: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (job: JobOpportunity) => {
    setEditing(job);
    setFormData({
      title: job.title, company: job.company, location: job.location, jobType: job.jobType,
      domainId: job.domainId, requiredSkills: job.requiredSkills.join(', '),
      experience: job.experience, salaryRange: job.salaryRange, description: job.description,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const skillsArr = formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    if (editing) {
      const updated = { ...editing, ...formData, requiredSkills: skillsArr };
      setJobs(jobs.map((j) => j.id === editing.id ? updated : j));
    } else {
      setJobs([...jobs, {
        id: `j${Date.now()}`, ...formData, requiredSkills: skillsArr,
        postedDate: new Date().toISOString().split('T')[0],
      }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => setJobs(jobs.filter((j) => j.id !== id));

  const columns = [
    { key: 'title', header: 'Title', render: (j: JobOpportunity) => <span className="font-medium text-gray-900">{j.title}</span> },
    { key: 'company', header: 'Company', render: (j: JobOpportunity) => <span className="text-gray-600">{j.company}</span> },
    { key: 'location', header: 'Location', render: (j: JobOpportunity) => <span className="text-gray-500 text-sm">{j.location}</span> },
    { key: 'domainId', header: 'Domain', render: (j: JobOpportunity) => <span className="text-gray-500 text-sm">{domainService.getById(j.domainId)?.name || '-'}</span> },
    { key: 'salaryRange', header: 'Salary', render: (j: JobOpportunity) => <span className="text-gray-600 text-sm">{j.salaryRange}</span> },
    { key: 'actions', header: 'Actions', render: (j: JobOpportunity) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(j)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(j.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      </div>
    ) },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Jobs</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">All Domains</option>
          {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Job' : 'Add Job'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select value={formData.jobType} onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <select value={formData.domainId} onChange={(e) => setFormData({ ...formData, domainId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input type="text" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="1-3 years" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
              <input type="text" value={formData.salaryRange} onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="₹6-10 LPA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
              <input type="text" value={formData.requiredSkills} onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="React, JavaScript, CSS" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">{editing ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
