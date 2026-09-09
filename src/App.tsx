

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentProfile from '@/pages/student/StudentProfile';
import DomainSelection from '@/pages/student/DomainSelection';
import JobRoleSelection from '@/pages/student/JobRoleSelection';
import SkillsModule from '@/pages/student/SkillsModule';
import AssessmentPage from '@/pages/student/AssessmentPage';
import SkillGapAnalysis from '@/pages/student/SkillGapAnalysis';
import TrainingRecommendations from '@/pages/student/TrainingRecommendations';
import TrainingProgress from '@/pages/student/TrainingProgress';
import JobOpportunities from '@/pages/student/JobOpportunities';
import ApplicationTracking from '@/pages/student/ApplicationTracking';
import EmploymentTracking from '@/pages/student/EmploymentTracking';

import InstituteDashboard from '@/pages/institute/InstituteDashboard';
import InstituteProfile from '@/pages/institute/InstituteProfile';
import InstitutePrograms from '@/pages/institute/InstitutePrograms';
import InstituteStudents from '@/pages/institute/InstituteStudents';
import InstituteOutcomes from '@/pages/institute/InstituteOutcomes';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminDomains from '@/pages/admin/AdminDomains';
import AdminSkills from '@/pages/admin/AdminSkills';
import AdminJobs from '@/pages/admin/AdminJobs';
import AdminTraining from '@/pages/admin/AdminTraining';
import AdminInstitutes from '@/pages/admin/AdminInstitutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />

          {/* Student routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/profile"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/domains"
            element={
              <ProtectedRoute roles={['student']}>
                <DomainSelection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/domains/job-roles"
            element={
              <ProtectedRoute roles={['student']}>
                <JobRoleSelection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/skills"
            element={
              <ProtectedRoute roles={['student']}>
                <SkillsModule />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/assessment"
            element={
              <ProtectedRoute roles={['student']}>
                <AssessmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/skill-gap"
            element={
              <ProtectedRoute roles={['student']}>
                <SkillGapAnalysis />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/training"
            element={
              <ProtectedRoute roles={['student']}>
                <TrainingRecommendations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/training-progress"
            element={
              <ProtectedRoute roles={['student']}>
                <TrainingProgress />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/jobs"
            element={
              <ProtectedRoute roles={['student']}>
                <JobOpportunities />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/applications"
            element={
              <ProtectedRoute roles={['student']}>
                <ApplicationTracking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/employment"
            element={
              <ProtectedRoute roles={['student']}>
                <EmploymentTracking />
              </ProtectedRoute>
            }
          />

          {/* Institute routes */}
          <Route
            path="/institute/dashboard"
            element={
              <ProtectedRoute roles={['institute']}>
                <InstituteDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/institute/profile"
            element={
              <ProtectedRoute roles={['institute']}>
                <InstituteProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/institute/programs"
            element={
              <ProtectedRoute roles={['institute']}>
                <InstitutePrograms />
              </ProtectedRoute>
            }
          />

          <Route
            path="/institute/students"
            element={
              <ProtectedRoute roles={['institute']}>
                <InstituteStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/institute/outcomes"
            element={
              <ProtectedRoute roles={['institute']}>
                <InstituteOutcomes />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/domains"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDomains />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/skills"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminSkills />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/training"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminTraining />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/institutes"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminInstitutes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

