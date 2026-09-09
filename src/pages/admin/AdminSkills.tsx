import { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { skillService, domainService } from '@/services/dataService';
import type { Skill } from '@/types';

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>(skillService.getAll());
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({ name: '', domainId: 'd1' });

  const domains = domainService.getAll();
  const filtered = skills.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (domainFilter !== 'all' && s.domainId !== domainFilter) return false;
    return true;
  });

  const openCreate = () => { setEditing(null); setFormData({ name: '', domainId: 'd1' }); setModalOpen(true); };
  const openEdit = (skill: Skill) => { setEditing(skill); setFormData({ name: skill.name, domainId: skill.domainId }); setModalOpen(true); };

  const handleSave = () => {
    if (editing) {
      const updated = { ...editing, name: formData.name, domainId: formData.domainId };
      setSkills(skills.map((s) => s.id === editing.id ? updated : s));
    } else {
      setSkills([...skills, { id: `s${Date.now()}`, name: formData.name, domainId: formData.domainId }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => setSkills(skills.filter((s) => s.id !== id));

  const columns = [
    { key: 'name', header: 'Skill Name', render: (s: Skill) => <span className="font-medium text-gray-900">{s.name}</span> },
    { key: 'domainId', header: 'Domain', render: (s: Skill) => <span className="text-gray-500 text-sm">{domainService.getById(s.domainId)?.name || '-'}</span> },
    { key: 'actions', header: 'Actions', render: (s: Skill) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(s)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      </div>
    ) },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Skills</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills..." className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">All Domains</option>
          {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Skill' : 'Add Skill'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <select value={formData.domainId} onChange={(e) => setFormData({ ...formData, domainId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
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
