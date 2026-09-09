import { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
  Clock,
  BookOpen,
} from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import Modal from '@/components/Modal';
import { useAuth } from '@/hooks/useAuth';
import {
  instituteService,
  domainService,
} from '@/services/dataService';
import { supabase } from '@/lib/supabase';

import type { TrainingProgram, CourseLevel } from '@/types';

export default function InstitutePrograms() {
  const { user } = useAuth();

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] =
    useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    domainId: 'd1',
    skillsCovered: '',
    durationWeeks: 8,
    level: 'Beginner' as CourseLevel,
    description: '',
  });

  if (!user) return null;

  const institute = instituteService.getAll()[0];
  const domains = domainService.getAll();

  useEffect(() => {
    const loadPrograms = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('institute_id', institute.id)
        .order('title');

      if (error) {
        console.error(
          'Error loading institute programs:',
          error
        );
        setPrograms([]);
        setLoading(false);
        return;
      }

      const mappedPrograms: TrainingProgram[] = (
        data || []
      ).map((program) => ({
        id: String(program.id),
        title: String(program.title),
        provider: String(program.provider || institute.name),
        instituteId: String(
          program.institute_id || institute.id
        ),
        domainId: String(program.domain_id),
        skillsCovered: Array.isArray(
          program.skills_covered
        )
          ? program.skills_covered.map((skill: unknown) =>
              String(skill)
            )
          : [],
        durationWeeks: Number(
          program.duration_weeks || 0
        ),
        level: program.level as CourseLevel,
        rating: Number(program.rating || 0),
        description: String(
          program.description || ''
        ),
      }));

      setPrograms(mappedPrograms);
      setLoading(false);
    };

    loadPrograms();
  }, [institute.id]);

  const filtered = programs.filter((program) =>
    program.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingProgram(null);

    setFormData({
      title: '',
      domainId: 'd1',
      skillsCovered: '',
      durationWeeks: 8,
      level: 'Beginner',
      description: '',
    });

    setModalOpen(true);
  };

  const openEdit = (
    program: TrainingProgram
  ) => {
    setEditingProgram(program);

    setFormData({
      title: program.title,
      domainId: program.domainId,
      skillsCovered:
        program.skillsCovered.join(', '),
      durationWeeks:
        program.durationWeeks,
      level: program.level,
      description: program.description,
    });

    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      return;
    }

    const skillsArr = formData.skillsCovered
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (editingProgram) {
      const { data, error } = await supabase
        .from('training_programs')
        .update({
          title: formData.title.trim(),
          domain_id: formData.domainId,
          skills_covered: skillsArr,
          duration_weeks:
            formData.durationWeeks,
          level: formData.level,
          description:
            formData.description.trim(),
        })
        .eq('id', editingProgram.id)
        .select()
        .single();

      if (error) {
        console.error(
          'Error updating training program:',
          error
        );
        return;
      }

      const updatedProgram: TrainingProgram = {
        id: String(data.id),
        title: String(data.title),
        provider: String(
          data.provider || institute.name
        ),
        instituteId: String(
          data.institute_id || institute.id
        ),
        domainId: String(data.domain_id),
        skillsCovered: Array.isArray(
          data.skills_covered
        )
          ? data.skills_covered.map(
              (skill: unknown) =>
                String(skill)
            )
          : [],
        durationWeeks: Number(
          data.duration_weeks || 0
        ),
        level: data.level as CourseLevel,
        rating: Number(data.rating || 0),
        description: String(
          data.description || ''
        ),
      };

      setPrograms((current) =>
        current.map((program) =>
          program.id === updatedProgram.id
            ? updatedProgram
            : program
        )
      );
    } else {
      const newId = `tp${Date.now()}`;

      const { data, error } = await supabase
        .from('training_programs')
        .insert({
          id: newId,
          title: formData.title.trim(),
          provider: institute.name,
          institute_id: institute.id,
          domain_id: formData.domainId,
          skills_covered: skillsArr,
          duration_weeks:
            formData.durationWeeks,
          level: formData.level,
          rating: 4.0,
          description:
            formData.description.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error(
          'Error creating training program:',
          error
        );
        return;
      }

      const newProgram: TrainingProgram = {
        id: String(data.id),
        title: String(data.title),
        provider: String(
          data.provider || institute.name
        ),
        instituteId: String(
          data.institute_id || institute.id
        ),
        domainId: String(data.domain_id),
        skillsCovered: Array.isArray(
          data.skills_covered
        )
          ? data.skills_covered.map(
              (skill: unknown) =>
                String(skill)
            )
          : [],
        durationWeeks: Number(
          data.duration_weeks || 0
        ),
        level: data.level as CourseLevel,
        rating: Number(data.rating || 0),
        description: String(
          data.description || ''
        ),
      };

      setPrograms((current) => [
        ...current,
        newProgram,
      ]);
    }

    setModalOpen(false);
    setEditingProgram(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('training_programs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        'Error deleting training program:',
        error
      );
      return;
    }

    setPrograms((current) =>
      current.filter(
        (program) => program.id !== id
      )
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading training programs...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-teal-600" />
            Training Programs
          </h2>

          <p className="text-gray-500">
            Create and manage your training programs.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Program
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search programs..."
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((program) => (
          <div
            key={program.id}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">
                {program.title}
              </h3>

              <span className="flex items-center gap-1 text-sm text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                {program.rating}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              {domainService.getById(
                program.domainId
              )?.name}
            </p>

            <p className="text-sm text-gray-600 mb-3">
              {program.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {program.skillsCovered
                .slice(0, 4)
                .map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {program.durationWeeks} weeks
              </span>

              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {program.level}
              </span>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() =>
                  openEdit(program)
                }
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(program.id)
                }
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingProgram
            ? 'Edit Program'
            : 'Create Program'
        }
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Title
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  title: event.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Program title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain
              </label>

              <select
                value={formData.domainId}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    domainId:
                      event.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {domains.map((domain) => (
                  <option
                    key={domain.id}
                    value={domain.id}
                  >
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>

              <select
                value={formData.level}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    level:
                      event.target
                        .value as CourseLevel,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Beginner">
                  Beginner
                </option>
                <option value="Intermediate">
                  Intermediate
                </option>
                <option value="Advanced">
                  Advanced
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (weeks)
              </label>

              <input
                type="number"
                value={
                  formData.durationWeeks
                }
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    durationWeeks: Number(
                      event.target.value
                    ),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma-separated)
              </label>

              <input
                type="text"
                value={
                  formData.skillsCovered
                }
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    skillsCovered:
                      event.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="React, JavaScript, CSS"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>

            <textarea
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description:
                    event.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Program description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() =>
                setModalOpen(false)
              }
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              {editingProgram
                ? 'Save Changes'
                : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
