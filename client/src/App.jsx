import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { HomePage } from './pages/HomePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage';

// Auth Views
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Student Views
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';
import { SavedJobsPage } from './pages/student/SavedJobsPage';
import { StudentInterviewsPage } from './pages/student/StudentInterviewsPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';

// Recruiter Views
import { CompanyProfilePage } from './pages/recruiter/CompanyProfilePage';
import { PostJobPage } from './pages/recruiter/PostJobPage';
import { RecruiterJobsPage } from './pages/recruiter/RecruiterJobsPage';
import { RecruiterApplicantsPage } from './pages/recruiter/RecruiterApplicantsPage';
import { RecruiterInterviewsPage } from './pages/recruiter/RecruiterInterviewsPage';
import { RecruiterAnalyticsPage } from './pages/recruiter/RecruiterAnalyticsPage';

// Admin Views
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminRecruitersPage } from './pages/admin/AdminRecruitersPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

// Public Job Views
import { JobsPage } from './pages/jobs/JobsPage';
import { JobDetailsPage } from './pages/jobs/JobDetailsPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Student Portal */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/applications" element={<StudentApplicationsPage />} />
          <Route path="/student/saved" element={<SavedJobsPage />} />
          <Route path="/student/interviews" element={<StudentInterviewsPage />} />
        </Route>
      </Route>

      {/* Recruiter Portal */}
      <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
        <Route element={<DashboardLayout />}>
         <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
          <Route path="/recruiter/company" element={<CompanyProfilePage />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
          <Route path="/recruiter/jobs/new" element={<PostJobPage />} />
          <Route path="/recruiter/applicants" element={<RecruiterApplicantsPage />} />
          <Route path="/recruiter/interviews" element={<RecruiterInterviewsPage />} />
          <Route path="/recruiter/analytics" element={<RecruiterAnalyticsPage />} />
        </Route>
      </Route>

      {/* Admin Console */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/recruiters" element={<AdminRecruitersPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  );
}

export default App;