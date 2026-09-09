import { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { domainService, jobRoleService } from '@/services/dataService';
import type { Domain } from '@/types';

export default function AdminDomains() {
  const [domains, setDomains] = useState<Domain[]>(domainService.getAll());
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Domain | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', skills: '', icon: 'Globe' });

  const filtered = domains.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', description: '', skills: '', icon: 'Globe' });
    setModalOpen(true);
  };

  const openEdit = (domain: Domain) => {
    setEditing(domain);
    setFormData({ name: domain.name, description: domain.description, skills: domain.skills.join(', '), icon: domain.icon });
    setModalOpen(true);
  };

  const handleSave = () => {
    const skillsArr = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (editing) {
      const updated = { ...editing, name: formData.name, description: formData.description, skills: skillsArr, icon: formData.icon };
      const idx = domains.findIndex((d) => d.id === editing.id);
      const newDomains = [...domains];
      newDomains[idx] = updated;
      setDomains(newDomains);
    } else {
      const newDomain: Domain = {
        id: `d${Date.now()}`,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        skills: skillsArr,
        jobRoleIds: [],
        jobCount: 0,
        trainingProgramCount: 0,
      };
      setDomains([...domains, newDomain]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDomains(domains.filter((d) => d.id !== id));
  };

  const columns = [
    { key: 'name', header: 'Name', render: (d: Domain) => <span className="font-medium text-gray-900">{d.name}</span> },
    { key: 'description', header: 'Description', render: (d: Domain) => <span className="text-gray-500 text-xs">{d.description}</span> },
    { key: 'skills', header: 'Skills', render: (d: Domain) => <span className="text-gray-600 text-xs">{d.skills.length} skills</span> },
    { key: 'jobCount', header: 'Jobs', render: (d: Domain) => <span className="text-gray-600">{d.jobCount}</span> },
    { key: 'actions', header: 'Actions', render: (d: Domain) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(d)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(d.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      </div>
    ) },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Domains</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Domain
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search domains..." className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Domain' : 'Add Domain'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input type="text" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="HTML, CSS, JavaScript" />
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
