import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Calendar, Star, Save } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { instituteService } from '@/services/dataService';

export default function InstituteProfile() {
  const { user } = useAuth();
  if (!user) return null;

  const institute = instituteService.getAll()[0];
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: institute.name,
    email: institute.email,
    phone: institute.phone,
    location: institute.location,
    establishedYear: institute.establishedYear,
  });

  const handleSave = () => {
    instituteService.update(institute.id, formData);
    setEditing(false);
  };

  const fields = [
    { icon: Building2, label: 'Institute Name', key: 'name' },
    { icon: Mail, label: 'Email', key: 'email' },
    { icon: Phone, label: 'Phone', key: 'phone' },
    { icon: MapPin, label: 'Location', key: 'location' },
    { icon: Calendar, label: 'Established Year', key: 'establishedYear' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 h-24" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12">
              <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <Building2 className="w-10 h-10 text-teal-600" />
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-gray-900">{institute.name}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {institute.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-gray-700">{institute.rating}</span>
              <span className="text-sm text-gray-400">| {institute.totalStudents} students | {institute.placementRate}% placement</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Institute Information</h3>
            <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
              <Save className="w-4 h-4" /> {editing ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                  <field.icon className="w-3.5 h-3.5" /> {field.label}
                </label>
                {editing ? (
                  <input
                    type={field.key === 'establishedYear' ? 'number' : 'text'}
                    value={String((formData as Record<string, unknown>)[field.key] ?? '')}
                    onChange={(e) => setFormData({ ...formData, [field.key]: field.key === 'establishedYear' ? Number(e.target.value) : e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                ) : (
                  <p className="text-sm text-gray-900 py-2">{String((formData as Record<string, unknown>)[field.key] ?? '')}</p>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
