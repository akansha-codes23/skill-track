import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Star } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { instituteService } from '@/services/dataService';
import type { TrainingInstitute } from '@/types';

export default function AdminInstitutes() {
  const [institutes, setInstitutes] = useState<TrainingInstitute[]>(instituteService.getAll());
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingInstitute | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '', state: '', district: '',
    establishedYear: 2020, rating: 4.0, totalStudents: 0, activeStudents: 0,
    completedTraining: 0, placementRate: 0, employmentRate: 0,
  });

  const filtered = institutes.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', email: '', phone: '', location: '', state: '', district: '', establishedYear: 2020, rating: 4.0, totalStudents: 0, activeStudents: 0, completedTraining: 0, placementRate: 0, employmentRate: 0 });
    setModalOpen(true);
  };

  const openEdit = (inst: TrainingInstitute) => {
    setEditing(inst);
    setFormData({ ...inst });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setInstitutes(institutes.map((i) => i.id === editing.id ? { ...editing, ...formData } : i));
    } else {
      setInstitutes([...institutes, { id: `ti${Date.now()}`, ...formData }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => setInstitutes(institutes.filter((i) => i.id !== id));

  const columns = [
    { key: 'name', header: 'Name', render: (i: TrainingInstitute) => <span className="font-medium text-gray-900 text-sm">{i.name}</span> },
    { key: 'location', header: 'Location', render: (i: TrainingInstitute) => <span className="text-gray-500 text-sm">{i.location}</span> },
    { key: 'totalStudents', header: 'Students', render: (i: TrainingInstitute) => <span className="text-gray-600 text-sm">{i.totalStudents}</span> },
    { key: 'placementRate', header: 'Placement', render: (i: TrainingInstitute) => <span className="text-green-600 text-sm font-medium">{i.placementRate}%</span> },
    { key: 'employmentRate', header: 'Employment', render: (i: TrainingInstitute) => <span className="text-indigo-600 text-sm font-medium">{i.employmentRate}%</span> },
    { key: 'rating', header: 'Rating', render: (i: TrainingInstitute) => <span className="flex items-center gap-1 text-amber-500 text-sm"><Star className="w-3.5 h-3.5 fill-amber-400" /> {i.rating}</span> },
    { key: 'actions', header: 'Actions', render: (i: TrainingInstitute) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(i)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(i.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      </div>
    ) },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Institutes</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Institute
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search institutes..." className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Institute' : 'Add Institute'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input type="text" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
              <input type="number" value={formData.establishedYear} onChange={(e) => setFormData({ ...formData, establishedYear: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Students</label>
              <input type="number" value={formData.totalStudents} onChange={(e) => setFormData({ ...formData, totalStudents: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placement Rate (%)</label>
              <input type="number" value={formData.placementRate} onChange={(e) => setFormData({ ...formData, placementRate: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
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
