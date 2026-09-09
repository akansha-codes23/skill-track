import { supabase } from '@/lib/supabase';
import {
  domains,
  skills,
  jobRoles,
  trainingPrograms,
  jobOpportunities,
  users,
  trainingInstitutes,
  jobApplications,
  employmentRecords,
  enrollments,
  assessmentQuestions,
  assessmentResults,
  currentUserSkills,
  allUsers,
  instituteUsers,
  adminUsers,
} from '@/data/mockData';
import type {
  Domain,
  Skill,
  JobRole,
  TrainingProgram,
  JobOpportunity,
  User,
  TrainingInstitute,
  JobApplication,
  EmploymentRecord,
  Enrollment,
  AssessmentQuestion,
  AssessmentResult,
  UserSkill,
  ApplicationStatus,
  EmploymentStatus,
  EmploymentType,
  SkillLevel,
  CourseLevel,
} from '@/types';

// Simulate async latency
const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

// ---------- Domains ----------
export const domainService = {
  getAll(): Domain[] {
  return domains;
},

  getById(id: string): Domain | undefined {
    return domains.find((d) => d.id === id);
  },
};

// ---------- Skills ----------
export const skillService = {
  getAll(): Skill[] {
    return skills;
  },

  getById(id: string): Skill | undefined {
    return skills.find((s) => s.id === id);
  },

  getByDomain(domainId: string): Skill[] {
    return skills.filter((s) => s.domainId === domainId);
  },
};
// ---------- Job Roles ----------
export const jobRoleService = {
  getAll(): JobRole[] {
  return jobRoles;
},

  getById(id: string): JobRole | undefined {
    return jobRoles.find((jr) => jr.id === id);
  },

  getByDomain(domainId: string): JobRole[] {
    return jobRoles.filter((jr) => jr.domainId === domainId);
  },
};

// ---------- Training Programs ----------
export const trainingService = {
  getAll(): TrainingProgram[] {
  return trainingPrograms;
},

  getById(id: string): TrainingProgram | undefined {
    return trainingPrograms.find((tp) => tp.id === id);
  },

  getByDomain(domainId: string): TrainingProgram[] {
    return trainingPrograms.filter((tp) => tp.domainId === domainId);
  },

  getByInstitute(instituteId: string): TrainingProgram[] {
    return trainingPrograms.filter((tp) => tp.instituteId === instituteId);
  },

  create(program: TrainingProgram): void {
    trainingPrograms.push(program);
  },

  update(id: string, updates: Partial<TrainingProgram>): void {
    const idx = trainingPrograms.findIndex((tp) => tp.id === id);

    if (idx >= 0) {
      trainingPrograms[idx] = {
        ...trainingPrograms[idx],
        ...updates,
      };
    }
  },

  delete(id: string): void {
    const idx = trainingPrograms.findIndex((tp) => tp.id === id);

    if (idx >= 0) {
      trainingPrograms.splice(idx, 1);
    }
  },
};
// ---------- Jobs ----------
export const jobService = {
  getAll(): JobOpportunity[] {
  return jobOpportunities;
},

  getById(id: string): JobOpportunity | undefined {
    return jobOpportunities.find((j) => j.id === id);
  },

  getByDomain(domainId: string): JobOpportunity[] {
    return jobOpportunities.filter((j) => j.domainId === domainId);
  },

  create(job: JobOpportunity): void {
    jobOpportunities.push(job);
  },

  update(id: string, updates: Partial<JobOpportunity>): void {
    const idx = jobOpportunities.findIndex((j) => j.id === id);

    if (idx >= 0) {
      jobOpportunities[idx] = {
        ...jobOpportunities[idx],
        ...updates,
      };
    }
  },

  delete(id: string): void {
    const idx = jobOpportunities.findIndex((j) => j.id === id);

    if (idx >= 0) {
      jobOpportunities.splice(idx, 1);
    }
  },
};

// ---------- Users ----------
export const userService = {
  getAll(): User[] {
    return allUsers;
  },
  getStudents(): User[] {
    return users;
  },
  getById(id: string): User | undefined {
    return allUsers.find((u) => u.id === id);
  },
  getByEmail(email: string): User | undefined {
    return allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  create(user: User): void {
    allUsers.push(user);
    if (user.role === 'student') users.push(user);
  },
  update(id: string, updates: Partial<User>): void {
    const idx = allUsers.findIndex((u) => u.id === id);
    if (idx >= 0) allUsers[idx] = { ...allUsers[idx], ...updates };
  },
  delete(id: string): void {
    const idx = allUsers.findIndex((u) => u.id === id);
    if (idx >= 0) allUsers.splice(idx, 1);
  },
};

// ---------- User Skills ----------
export const userSkillService = {
  getByUserId(_userId: string): UserSkill[] {
    return [...currentUserSkills];
  },

  add(skill: UserSkill): void {
    const exists = currentUserSkills.find(
      (s) => s.skillId === skill.skillId
    );

    if (!exists) {
      currentUserSkills.push(skill);
    }
  },

  update(skillId: string, level: SkillLevel): void {
    const s = currentUserSkills.find(
      (s) => s.skillId === skillId
    );

    if (s) {
      s.level = level;
    }
  },

  remove(skillId: string): void {
    const idx = currentUserSkills.findIndex(
      (s) => s.skillId === skillId
    );

    if (idx >= 0) {
      currentUserSkills.splice(idx, 1);
    }
  },
};

// ---------- Applications ----------
export const applicationService = {
  getByUserId(userId: string): JobApplication[] {
    return jobApplications.filter((a) => a.userId === userId);
  },
  getAll(): JobApplication[] {
    return jobApplications;
  },
  apply(application: JobApplication): void {
    jobApplications.push(application);
  },
  updateStatus(id: string, status: ApplicationStatus): void {
    const app = jobApplications.find((a) => a.id === id);
    if (app) app.status = status;
  },
};

// ---------- Employment ----------
export const employmentService = {
  getByUserId(userId: string): EmploymentRecord | undefined {
    return employmentRecords.find((e) => e.userId === userId);
  },
  getAll(): EmploymentRecord[] {
    return employmentRecords;
  },
  update(userId: string, updates: Partial<EmploymentRecord>): void {
    const idx = employmentRecords.findIndex((e) => e.userId === userId);
    if (idx >= 0) {
      employmentRecords[idx] = { ...employmentRecords[idx], ...updates };
    } else {
      employmentRecords.push({
        id: `er${Date.now()}`,
        userId,
        status: updates.status || 'Seeking',
        ...updates,
      } as EmploymentRecord);
    }
  },
};

// ---------- Enrollments ----------
export const enrollmentService = {
  getByUserId(userId: string): Enrollment[] {
    return enrollments.filter((e) => e.userId === userId);
  },
  getAll(): Enrollment[] {
    return enrollments;
  },
  enroll(enrollment: Enrollment): void {
    enrollments.push(enrollment);
  },
  updateProgress(id: string, progress: number): void {
    const e = enrollments.find((e) => e.id === id);
    if (e) {
      e.progress = progress;
      if (progress >= 100) e.status = 'Completed';
    }
  },
};

// ---------- Assessment ----------
export const assessmentService = {
  getQuestionsByDomain(domainId: string): AssessmentQuestion[] {
    return assessmentQuestions.filter((q) => q.domainId === domainId);
  },
  getResultsByUser(userId: string): AssessmentResult[] {
    return assessmentResults.filter((r) => r.userId === userId);
  },
  saveResult(result: AssessmentResult): void {
    assessmentResults.push(result);
  },
};

// ---------- Training Institutes ----------
export const instituteService = {
  getAll(): TrainingInstitute[] {
    return trainingInstitutes;
  },
  getById(id: string): TrainingInstitute | undefined {
    return trainingInstitutes.find((i) => i.id === id);
  },
  getByEmail(email: string): TrainingInstitute | undefined {
    return trainingInstitutes.find((i) => i.email.toLowerCase() === email.toLowerCase());
  },
  create(institute: TrainingInstitute): void {
    trainingInstitutes.push(institute);
  },
  update(id: string, updates: Partial<TrainingInstitute>): void {
    const idx = trainingInstitutes.findIndex((i) => i.id === id);
    if (idx >= 0) trainingInstitutes[idx] = { ...trainingInstitutes[idx], ...updates };
  },
  delete(id: string): void {
    const idx = trainingInstitutes.findIndex((i) => i.id === id);
    if (idx >= 0) trainingInstitutes.splice(idx, 1);
  },
};

// ---------- Auth ----------
export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();

    // First: use the working local/demo login
    let user = allUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        u.password === password
    );

    // Current Student demo account
    if (
      !user &&
      cleanEmail === 'skilltrack.demo.student@gmail.com' &&
      password === 'DemoStudent123!'
    ) {
      const student = users.find((u) => u.id === 'u1');

      if (student) {
        user = {
          ...student,
          email: cleanEmail,
        };
      }
    }

    if (!user) {
      return null;
    }

    /*
      Also create a Supabase Auth session.

      This does NOT control whether login succeeds.
      The local login above remains the main login system.
    */
    try {
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
    } catch {
      // Ignore Supabase auth failure.
      // Local login should still work.
    }

    return user;
  },

  async register(
    name: string,
    email: string,
    password: string,
    role: 'student' | 'institute'
  ): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    // Create Supabase Auth account
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      throw error || new Error('Unable to create account.');
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email: cleanEmail,
      password,
      role,
      profileCompletion: 20,
      skillScore: 0,
      skillGapPercentage: 0,
      trainingProgress: 0,
      employmentStatus: 'Unemployed',
    };

    allUsers.push(newUser);

    if (role === 'student') {
      users.push(newUser);
    }

    if (role === 'institute') {
      instituteUsers.push(newUser);
    }

    return newUser;
  },
};

// ---------- Skill Gap Analysis (rule-based) ----------
export function calculateSkillGap(
  userSkillsList: UserSkill[],
  requiredSkills: string[]
): {
  acquired: string[];
  missing: string[];
  gapPercentage: number;
  prioritySkills: string[];
} {
  const userSkillNames = userSkillsList.map((s) => s.skillName);
  const acquired = requiredSkills.filter((s) => userSkillNames.includes(s));
  const missing = requiredSkills.filter((s) => !userSkillNames.includes(s));
  const gapPercentage = requiredSkills.length > 0
    ? Math.round((missing.length / requiredSkills.length) * 100)
    : 0;
  return {
    acquired,
    missing,
    gapPercentage,
    prioritySkills: missing.slice(0, 3),
  };
}

// ---------- Job Match Score (rule-based) ----------
export function calculateJobMatch(
  userSkillsList: UserSkill[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 0;
  const userSkillNames = userSkillsList.map((s) => s.skillName);
  const matched = requiredSkills.filter((s) => userSkillNames.includes(s));
  return Math.round((matched.length / requiredSkills.length) * 100);
}

// Re-export for convenience
export { instituteUsers, adminUsers };
export type { CourseLevel, EmploymentType, EmploymentStatus };
