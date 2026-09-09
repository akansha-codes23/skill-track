import { useState } from 'react';
import { Search, Trash2, Pencil } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { userService, domainService } from '@/services/dataService';
import type { User, UserRole, EmploymentStatus } from '@/types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(userService.getAll());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const handleDelete = (id: string) => setUsers(users.filter((u) => u.id !== id));

  const openEdit = (user: User) => { setEditing(user); setModalOpen(true); };

  const handleSave = () => {
    if (editing) {
      setUsers(users.map((u) => u.id === editing.id ? editing : u));
    }
    setModalOpen(false);
  };

  const columns = [
    { key: 'name', header: 'Name', render: (u: User) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-xs">{u.name.charAt(0)}</div>
        <span className="font-medium text-gray-900 text-sm">{u.name}</span>
      </div>
    ) },
    { key: 'email', header: 'Email', render: (u: User) => <span className="text-gray-500 text-sm">{u.email}</span> },
    { key: 'role', header: 'Role', render: (u: User) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'student' ? 'bg-blue-100 text-blue-700' : u.role === 'institute' ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'}`}>{u.role}</span>
    ) },
    { key: 'domainId', header: 'Domain', render: (u: User) => <span className="text-gray-500 text-sm">{u.domainId ? domainService.getById(u.domainId)?.name : '-'}</span> },
    { key: 'employmentStatus', header: 'Employment', render: (u: User) => <StatusBadge status={u.employmentStatus} /> },
    { key: 'actions', header: 'Actions', render: (u: User) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(u)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      </div>
    ) },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="institute">Institute</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit User">
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="student">Student</option>
                <option value="institute">Institute</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
              <select value={editing.employmentStatus} onChange={(e) => setEditing({ ...editing, employmentStatus: e.target.value as EmploymentStatus })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Employed">Employed</option>
                <option value="Seeking">Seeking</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
