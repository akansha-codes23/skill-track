import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Briefcase,
  FileText,
  Award,
  Save,
  Plus,
  X,
  Code2,
} from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

import SkillBadge from '@/components/SkillBadge';

import type {
  SkillLevel,
  UserSkill,
} from '@/types';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  education: string;
  graduationYear: number;
  experience: string;
  certifications: string[];
}

export default function StudentProfile() {
  const { user, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCert, setNewCert] = useState('');

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    state: '',
    district: '',
    education: '',
    graduationYear: 2024,
    experience: '',
    certifications: [],
  });

  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load profile information from Supabase
        const { data, error } = await supabase
          .from('users')
          .select(
            'name, email, phone, state, district, education, graduation_year, experience, certifications'
          )
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            state: data.state || '',
            district: data.district || '',
            education: data.education || '',
            graduationYear: data.graduation_year || 2024,
            experience: data.experience || '',
            certifications: Array.isArray(data.certifications)
              ? data.certifications
              : [],
          });
        }

        // Load student's skills from Supabase
        const { data: skillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select('skill_id, skill_name, level')
          .eq('user_id', user.id)
          .order('id');

        if (skillsError) {
          throw skillsError;
        }

        const skills: UserSkill[] = (skillsData || []).map((skill) => ({
          skillId: String(skill.skill_id),
          skillName: String(skill.skill_name),
          level: skill.level as SkillLevel,
        }));

        setUserSkills(skills);
      } catch (error) {
        console.error('Error loading profile:', error);

        setFormData((current) => ({
          ...current,
          name: user.name || '',
          email: user.email || '',
          state: user.state || '',
          district: user.district || '',
        }));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    try {
      setSaving(true);

      const updatedProfile = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        education: formData.education.trim(),
        graduation_year: formData.graduationYear,
        experience: formData.experience.trim(),
        certifications: formData.certifications,
      };

      const { error } = await supabase
        .from('users')
        .update(updatedProfile)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local login information
      updateUser({
        name: updatedProfile.name,
        email: updatedProfile.email,
        state: updatedProfile.state,
        district: updatedProfile.district,
      });

      // Keep the UI in sync
      setFormData((current) => ({
        ...current,
        ...{
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          state: updatedProfile.state,
          district: updatedProfile.district,
          education: updatedProfile.education,
          graduationYear: updatedProfile.graduation_year,
          experience: updatedProfile.experience,
          certifications: updatedProfile.certifications,
        },
      }));

      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Unable to save the changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addCert = () => {
    const certification = newCert.trim();

    if (!certification) return;

    setFormData((current) => ({
      ...current,
      certifications: [
        ...current.certifications,
        certification,
      ],
    }));

    setNewCert('');
  };

  const removeCert = (index: number) => {
    setFormData((current) => ({
      ...current,
      certifications: current.certifications.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const profileFields = [
    {
      icon: User,
      label: 'Name',
      key: 'name',
      type: 'text',
    },
    {
      icon: Mail,
      label: 'Email',
      key: 'email',
      type: 'email',
    },
    {
      icon: Phone,
      label: 'Phone',
      key: 'phone',
      type: 'text',
    },
    {
      icon: GraduationCap,
      label: 'Education',
      key: 'education',
      type: 'text',
    },
    {
      icon: Calendar,
      label: 'Graduation Year',
      key: 'graduationYear',
      type: 'number',
    },
    {
      icon: Briefcase,
      label: 'Experience',
      key: 'experience',
      type: 'text',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">
            Loading profile...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-24" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {formData.name.charAt(0).toUpperCase()}
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {formData.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {formData.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (editing) {
                    handleSave();
                  } else {
                    setEditing(true);
                  }
                }}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />

                {saving
                  ? 'Saving...'
                  : editing
                    ? 'Save Changes'
                    : 'Edit Profile'}
              </button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">
                  Profile Completion
                </span>

                <span className="font-medium text-gray-700">
                  {user.profileCompletion}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{
                    width: `${user.profileCompletion}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {profileFields.map((field) => {
              const Icon = field.icon;

              const value =
                formData[
                  field.key as keyof ProfileFormData
                ];

              return (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    {field.label}
                  </label>

                  {editing ? (
                    <input
                      type={field.type}
                      value={value as string | number}
                      onChange={(e) =>
                        setFormData((current) => ({
                          ...current,
                          [field.key]:
                            field.type === 'number'
                              ? Number(e.target.value)
                              : e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">
                      {String(value ?? '')}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </label>

              {editing ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        district: e.target.value,
                      }))
                    }
                    placeholder="District"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />

                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        state: e.target.value,
                      }))
                    }
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-900 py-2">
                  {formData.district && formData.state
                    ? `${formData.district}, ${formData.state}`
                    : formData.district || formData.state || ''}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            My Skills
          </h3>

          {userSkills.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">
              No skills added yet. Add skills from the My Skills section.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userSkills.map((skill) => (
                <div
                  key={skill.skillId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <SkillBadge
                    name={skill.skillName}
                    level={skill.level}
                  />

                  <span className="text-xs text-gray-500">
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resume */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resume
          </h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-600" />

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formData.name.replace(/\s+/g, '_')}_Resume.pdf
                </p>

                <p className="text-xs text-gray-400">
                  Resume section
                </p>
              </div>
            </div>

            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              {editing ? 'Upload New' : 'Download'}
            </button>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </h3>

          <div className="space-y-2">
            {formData.certifications.map((cert, index) => (
              <div
                key={`${cert}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">
                  {cert}
                </span>

                {editing && (
                  <button
                    onClick={() => removeCert(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {formData.certifications.length === 0 &&
              !editing && (
                <p className="text-sm text-gray-400 py-2">
                  No certifications added yet.
                </p>
              )}

            {editing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) =>
                    setNewCert(e.target.value)
                  }
                  placeholder="Add certification"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCert();
                    }
                  }}
                />

                <button
                  onClick={addCert}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {editing && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />

                {saving
                  ? 'Saving...'
                  : 'Save All Changes'}
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}