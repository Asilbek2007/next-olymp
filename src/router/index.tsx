import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { OlympiadListPage } from '../pages/public/OlympiadListPage';
import { OlympiadDetailPage } from '../pages/public/OlympiadDetailPage';
import { LeaderboardPage } from '../pages/public/LeaderboardPage';
import { VerifyCertificatePage } from '../pages/public/VerifyCertificatePage';
import { AboutPage } from '../pages/public/AboutPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { TermsPage } from '../pages/public/TermsPage';
import { PrivacyPage } from '../pages/public/PrivacyPage';
import { RulesPage } from '../pages/public/RulesPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { ContestParticipatePage } from '../pages/student/ContestParticipatePage';
import { ExamDiagnosticPage } from '../pages/student/ExamDiagnosticPage';
import { StudentResultsPage } from '../pages/student/StudentResultsPage';
import { StudentCertificatesPage } from '../pages/student/StudentCertificatesPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentOlympiadsPage } from '../pages/student/StudentOlympiadsPage';
import { StudentLeaderboardPage } from '../pages/student/StudentLeaderboardPage';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { TeacherOlympiadsPage } from '../pages/teacher/TeacherOlympiadsPage';

// EGA Dedicated Admin Panel Pages
import { EgaLoginPage } from '../pages/ega/EgaLoginPage';
import { EgaDashboardPage } from '../pages/ega/EgaDashboardPage';
import { EgaCompetitionsPage } from '../pages/ega/EgaCompetitionsPage';
import { EgaSingleCompetitionPage } from '../pages/ega/EgaSingleCompetitionPage';
import { EgaLeaderboardPage } from '../pages/ega/EgaLeaderboardPage';
import { EgaSubjectsPage } from '../pages/ega/EgaSubjectsPage';
import { EgaUsersPage } from '../pages/ega/EgaUsersPage';
import { EgaProctoringPage } from '../pages/ega/EgaProctoringPage';
import { EgaCertificatesPage } from '../pages/ega/EgaCertificatesPage';
import { EgaFinancePage } from '../pages/ega/EgaFinancePage';
import { EgaTeamPage } from '../pages/ega/EgaTeamPage';
import { EgaLocationsPage } from '../pages/ega/EgaLocationsPage';
import { EgaNotificationsPage } from '../pages/ega/EgaNotificationsPage';
import { EgaSupportPage } from '../pages/ega/EgaSupportPage';
import { EgaPackagesPage } from '../pages/ega/EgaPackagesPage';
import { EgaSecurityPage } from '../pages/ega/EgaSecurityPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/olympiads" element={<OlympiadListPage />} />
      <Route path="/olympiads/:id" element={<OlympiadDetailPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/verify/:code" element={<VerifyCertificatePage />} />
      <Route path="/about" element={<AboutPage />} />

      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/rules" element={<RulesPage />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Student Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/olympiads"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <StudentOlympiadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leaderboard"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <StudentLeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/olympiads/:id/diagnostic"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <ExamDiagnosticPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/olympiads/:id/participate"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <ContestParticipatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCertificatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Teacher Protected Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/olympiads"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherOlympiadsPage />
          </ProtectedRoute>
        }
      />

      {/* Dedicated Secret EGA Admin Panel Routes (/ega & /admin) */}
      <Route path="/ega/login" element={<EgaLoginPage />} />
      <Route path="/admin/login" element={<EgaLoginPage />} />
      <Route
        path="/ega"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/competitions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaCompetitionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/leaderboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaLeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/competitions/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaSingleCompetitionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/subjects"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaSubjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/locations"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaLocationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/team"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaTeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/proctoring"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaProctoringPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/certificates"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaCertificatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/finance"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaFinancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/notifications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaNotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/support"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaSupportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/packages"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaPackagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ega/security"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EgaSecurityPage />
          </ProtectedRoute>
        }
      />

      {/* Backward Compatibility Fallback */}
      <Route path="/admin" element={<Navigate to="/ega" replace />} />
      <Route path="/admin/*" element={<Navigate to="/ega" replace />} />
    </Routes>
  );
};
