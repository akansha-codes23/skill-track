export type UserRole = 'student' | 'institute' | 'admin';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected';

export type EmploymentStatus = 'Employed' | 'Seeking' | 'Unemployed';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type EnrollmentStatus = 'In Progress' | 'Completed' | 'Not Started';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  graduationYear: number;
  experience: string;
  resumeUrl?: string;
  certifications: string[];
  role: UserRole;
  avatarUrl?: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: string[];
  jobRoleIds: string[];
  jobCount: number;
  trainingProgramCount: number;
}

export interface Skill {
  id: string;
  name: string;
  domainId: string;
}

export interface UserSkill {
  skillId: string;
  skillName: string;
  level: SkillLevel;
}

export interface JobRole {
  id: string;
  domainId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  recommendedTrainingIds: string[];
}

export interface AssessmentQuestion {
  id: string;
  domainId: string;
  skillId: string;
  skillName: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  domainId: string;
  score: number;
  totalQuestions: number;
  strongSkills: string[];
  weakSkills: string[];
  recommendedSkills: string[];
  takenAt: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  provider: string;
  instituteId: string;
  domainId: string;
  skillsCovered: string[];
  durationWeeks: number;
  level: CourseLevel;
  rating: number;
  description: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  trainingProgramId: string;
  progress: number;
  startDate: string;
  expectedCompletionDate: string;
  status: EnrollmentStatus;
  skillsDeveloped: string[];
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: JobType;
  domainId: string;
  requiredSkills: string[];
  experience: string;
  postedDate: string;
  salaryRange: string;
  description: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  appliedDate: string;
  location: string;
}

export interface EmploymentRecord {
  id: string;
  userId: string;
  status: EmploymentStatus;
  company?: string;
  jobRole?: string;
  joiningDate?: string;
  salaryRange?: string;
  employmentType?: EmploymentType;
  domainId?: string;
}

export interface TrainingInstitute {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  state: string;
  district: string;
  establishedYear: number;
  rating: number;
  totalStudents: number;
  activeStudents: number;
  completedTraining: number;
  placementRate: number;
  employmentRate: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  domainId?: string;
  jobRoleId?: string;
  profileCompletion: number;
  skillScore: number;
  skillGapPercentage: number;
  trainingProgress: number;
  employmentStatus: EmploymentStatus;
  state?: string;
  district?: string;
}
