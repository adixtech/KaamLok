import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { FullScreenLoader } from './components/ui/Loading';
import { useAuth } from './context/AuthContext';

import { LandingPage } from './pages/LandingPage';
import { GetStarted } from './pages/auth/GetStarted';
import { StudentRegister } from './pages/auth/StudentRegister';
import { NGORegister } from './pages/auth/NGORegister';
import { VerifyOTP } from './pages/auth/VerifyOTP';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { PendingApproval } from './pages/auth/PendingApproval';
import { StudentDashboard, NGODashboard } from './pages/dashboards/Dashboards';

// Lazy-loaded admin pages for code splitting
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const NGOManagementPage = lazy(() => import('./pages/admin/NGOManagementPage').then((m) => ({ default: m.NGOManagementPage })));
const StudentManagementPage = lazy(() => import('./pages/admin/StudentManagementPage').then((m) => ({ default: m.StudentManagementPage })));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const AdminManagementPage = lazy(() => import('./pages/admin/AdminManagementPage').then((m) => ({ default: m.AdminManagementPage })));
const CourseManagementPage = lazy(() => import('./pages/admin/CourseManagementPage').then((m) => ({ default: m.CourseManagementPage })));
const ApplicationManagementPage = lazy(() => import('./pages/admin/ApplicationManagementPage').then((m) => ({ default: m.ApplicationManagementPage })));
const NotificationsPage = lazy(() => import('./pages/admin/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const CompaniesPage = lazy(() => import('./pages/admin/CompaniesPage').then((m) => ({ default: m.CompaniesPage })));

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullScreenLoader label="Loading admin..." />}>{children}</Suspense>;
}

/**
 * NGO route guard: approved NGOs see their dashboard; everyone else
 * with the ngo role sees the pending-approval page.
 */
function NGORoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user?.role === 'ngo' && user.verificationStatus !== 'approved') {
    return <PendingApproval />;
  }
  return <NGODashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/get-started" element={<PublicOnlyRoute><GetStarted /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register/student" element={<PublicOnlyRoute><StudentRegister /></PublicOnlyRoute>} />
      <Route path="/register/ngo" element={<PublicOnlyRoute><NGORegister /></PublicOnlyRoute>} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Private — role-scoped */}
      <Route path="/student/dashboard" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/ngo/dashboard" element={<ProtectedRoute><RoleRoute roles={['ngo']}><NGORoute /></RoleRoute></ProtectedRoute>} />
      <Route path="/ngo/pending" element={<ProtectedRoute><RoleRoute roles={['ngo']}><PendingApproval /></RoleRoute></ProtectedRoute>} />

      {/* Admin — full admin module */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><AdminDashboardPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/ngos" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><NGOManagementPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><StudentManagementPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><AnalyticsPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/admins" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><AdminManagementPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><CourseManagementPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><ApplicationManagementPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><NotificationsPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><AuditLogsPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><SettingsPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><ReportsPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/companies" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSuspense><CompaniesPage /></AdminSuspense></RoleRoute></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '1rem',
              background: '#0f172a',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
