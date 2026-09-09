import { useEffect, useState } from 'react';
import { Code2, Plus, Trash2, Globe } from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

import {
  domainService,
  skillService,
} from '@/services/dataService';

import SkillBadge from '@/components/SkillBadge';

import type {
  Domain,
  Skill,
  SkillLevel,
  UserSkill,
} from '@/types';

const levels: SkillLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

export default function SkillsModule() {
  const { user, updateUser } = useAuth();

  const [domain, setDomain] = useState<Domain | null>(null);
  const [domainSkills, setDomainSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] =
    useState<SkillLevel>('Beginner');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load the student's domain
        if (user.domainId) {
          const selectedDomain = domainService.getById(
            user.domainId
          );

          if (selectedDomain) {
            setDomain(selectedDomain);

            const allSkills = skillService.getAll();

            const skillsForDomain = allSkills.filter(
              (skill) =>
                skill.domainId === selectedDomain.id
            );

            setDomainSkills(skillsForDomain);
          }
        }

        // Load student's skills from Supabase
        const { data, error } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id)
          .order('id');

        if (error) {
          throw error;
        }

        const skills: UserSkill[] = (data || []).map(
          (skill) => ({
            skillId: skill.skill_id,
            skillName: skill.skill_name,
            level: skill.level as SkillLevel,
          })
        );

        setUserSkills(skills);
      } catch (error) {
        console.error(
          'Error loading student skills:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) return null;

  const availableSkills = domainSkills.filter(
    (skill) =>
      !userSkills.some(
        (userSkill) =>
          userSkill.skillId === skill.id
      )
  );

  const handleAdd = async () => {
    if (!selectedSkill || !user) return;

    const skill = domainSkills.find(
      (s) => s.id === selectedSkill
    );

    if (!skill) return;

    try {
      setSaving(true);

      const newSkillId = `us-${Date.now()}`;

      // Save skill to Supabase
      const { error } = await supabase
        .from('user_skills')
        .insert({
          id: newSkillId,
          user_id: user.id,
          skill_id: skill.id,
          skill_name: skill.name,
          level: selectedLevel,
        });

      if (error) {
        throw error;
      }

      // Update the page immediately
      const newSkill: UserSkill = {
        skillId: skill.id,
        skillName: skill.name,
        level: selectedLevel,
      };

      const updatedSkills = [
        ...userSkills,
        newSkill,
      ];

      setUserSkills(updatedSkills);

      // Update skill score
      const newScore = Math.min(
        100,
        updatedSkills.length * 10 + 30
      );

      updateUser({
        skillScore: newScore,
      });

      // Save skill score to Supabase
      const { error: scoreError } = await supabase
        .from('users')
        .update({
          skill_score: newScore,
        })
        .eq('id', user.id);

      if (scoreError) {
        console.error(
          'Error updating skill score:',
          scoreError
        );
      }

      setSelectedSkill('');
      setSelectedLevel('Beginner');
      setShowAdd(false);
    } catch (error) {
      console.error(
        'Error adding skill:',
        error
      );

      alert(
        'Unable to add skill. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (skillId: string) => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id)
        .eq('skill_id', skillId);

      if (error) {
        throw error;
      }

      const updatedSkills =
        userSkills.filter(
          (skill) =>
            skill.skillId !== skillId
        );

      setUserSkills(updatedSkills);

      // Recalculate skill score
      const newScore = Math.min(
        100,
        updatedSkills.length * 10 + 30
      );

      updateUser({
        skillScore: newScore,
      });

      const { error: scoreError } =
        await supabase
          .from('users')
          .update({
            skill_score: newScore,
          })
          .eq('id', user.id);

      if (scoreError) {
        console.error(
          'Error updating skill score:',
          scoreError
        );
      }
    } catch (error) {
      console.error(
        'Error removing skill:',
        error
      );

      alert(
        'Unable to remove skill. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLevelChange = async (
    skillId: string,
    level: SkillLevel
  ) => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_skills')
        .update({
          level,
        })
        .eq('user_id', user.id)
        .eq('skill_id', skillId);

      if (error) {
        throw error;
      }

      setUserSkills((currentSkills) =>
        currentSkills.map((skill) =>
          skill.skillId === skillId
            ? {
                ...skill,
                level,
              }
            : skill
        )
      );
    } catch (error) {
      console.error(
        'Error updating skill level:',
        error
      );

      alert(
        'Unable to update skill level. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">
            Loading skills...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!domain) {
    return (
      <DashboardLayout>
        <div className="bg-amber-50 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            Please select a domain first.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            My Skills
          </h2>

          <p className="text-gray-500 flex items-center gap-1">
            <Globe className="w-4 h-4" />
            Domain: {domain.name}
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Add a New Skill
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill
              </label>

              <select
                value={selectedSkill}
                onChange={(e) =>
                  setSelectedSkill(e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">
                  Select a skill...
                </option>

                {availableSkills.map((skill) => (
                  <option
                    key={skill.id}
                    value={skill.id}
                  >
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency Level
              </label>

              <select
                value={selectedLevel}
                onChange={(e) =>
                  setSelectedLevel(
                    e.target.value as SkillLevel
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {levels.map((level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAdd(false)}
              disabled={saving}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleAdd}
              disabled={saving || !selectedSkill}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600" />
          Your Skills ({userSkills.length})
        </h3>

        {userSkills.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">
            No skills added yet. Click "Add Skill" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {userSkills.map((userSkill) => (
              <div
                key={userSkill.skillId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <SkillBadge
                    name={userSkill.skillName}
                    level={userSkill.level}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={userSkill.level}
                    onChange={(e) =>
                      handleLevelChange(
                        userSkill.skillId,
                        e.target.value as SkillLevel
                      )
                    }
                    disabled={saving}
                    className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  >
                    {levels.map((level) => (
                      <option
                        key={level}
                        value={level}
                      >
                        {level}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      handleRemove(userSkill.skillId)
                    }
                    disabled={saving}
                    className="text-red-500 hover:text-red-600 p-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          All Skills in {domain.name}
        </h3>

        <div className="flex flex-wrap gap-2">
          {domainSkills.map((skill) => {
            const hasSkill = userSkills.find(
              (userSkill) =>
                userSkill.skillId === skill.id
            );

            return (
              <span
                key={skill.id}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  hasSkill
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                {skill.name} {hasSkill && '✓'}
              </span>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}