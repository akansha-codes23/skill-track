import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Star } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { trainingService, domainService, instituteService } from '@/services/dataService';
import type { TrainingProgram, CourseLevel } from '@/types';

export default function AdminTraining() {
  const [programs, setPrograms] = useState<TrainingProgram[]>(trainingService.getAll());
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingProgram | null>(null);
  const [formData, setFormData] = useState({
    title: '', provider: '', domainId: 'd1', skillsCovered: '',
    durationWeeks: 8, level: 'Beginner' as CourseLevel, description: '',
  });

  const domains = domainService.getAll();
  const institutes = instituteService.getAll();

  const filtered = programs.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (domainFilter !== 'all' && p.domainId !== domainFilter) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', provider: '', domainId: 'd1', skillsCovered: '', durationWeeks: 8, level: 'Beginner', description: '' });
    setModalOpen(true);
  };

  const openEdit = (p: TrainingProgram) => {
    setEditing(p);
    setFormData({
      title: p.title, provider: p.provider, domainId: p.domainId,
      skillsCovered: p.skillsCovered.join(', '), durationWeeks: p.durationWeeks,
      level: p.level, description: p.description,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const skillsArr = formData.skillsCovered.split(',').map((s) => s.trim()).filter(Boolean);
    if (editing) {
      const updated = { ...editing, ...formData, skillsCovered: skillsArr };
      setPrograms(programs.map((p) => p.id === editing.id ? updated : p));
    } else {
      setPrograms([...programs, {
        id: `tp${Date.now()}`, ...formData, skillsCovered: skillsArr,
        instituteId: 'ti1', rating: 4.0,
      }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => setPrograms(programs.filter((p) => p.id !== id));

  const columns = [
    { key: 'title', header: 'Title', render: (p: TrainingProgram) => <span className="font-medium text-gray-900 text-sm">{p.title}</span> },
    { key: 'provider', header: 'Provider', render: (p: TrainingProgram) => <span className="text-gray-500 text-sm">{p.provider}</span> },
    { key: 'domainId', header: 'Domain', render: (p: TrainingProgram) => <span className="text-gray-500 text-sm">{domainService.getById(p.domainId)?.name || '-'}</span> },
    { key: 'level', header: 'Level', render: (p: TrainingProgram) => <span className="text-gray-600 text-sm">{p.level}</span> },
    { key: 'durationWeeks', header: 'Duration', render: (p: TrainingProgram) => <span className="text-gray-600 text-sm">{p.durationWeeks}w</span> },
    { key: 'rating', header: 'Rating', render: (p: TrainingProgram) => <span className="flex items-center gap-1 text-amber-500 text-sm"><Star className="w-3.5 h-3.5 fill-amber-400" /> {p.rating}</span> },
    { key: 'actions', header: 'Actions', render: (p: TrainingProgram) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(p)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      </div>
    ) },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Training Programs</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Program
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search programs..." className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">All Domains</option>
          {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Program' : 'Add Program'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <input type="text" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <select value={formData.domainId} onChange={(e) => setFormData({ ...formData, domainId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
              <input type="number" value={formData.durationWeeks} onChange={(e) => setFormData({ ...formData, durationWeeks: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value as CourseLevel })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input type="text" value={formData.skillsCovered} onChange={(e) => setFormData({ ...formData, skillsCovered: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="React, JavaScript" />
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
