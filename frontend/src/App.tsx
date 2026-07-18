import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { FullScreenLoader } from './components/ui/Loading';
import { useAuth } from './context/AuthContext';

import { LandingPage } from './pages/LandingPage';
//add by me for course page to ngo integration 5 lines
import { AllProgramsPage } from './pages/public/AllProgramsPage';
import { CourseDetailsPage } from './pages/public/CourseDetailsPage';
import { NGOPublicProfilePage } from './pages/public/NGOPublicProfilePage';
import { SuccessStoriesPage } from './pages/public/SuccessStoriesPage';
import { ContactSupportPage } from './pages/public/ContactSupportPage';
//end by me for course page to ngo integration 5 lines

import { GetStarted } from './pages/auth/GetStarted';
import { StudentRegister } from './pages/auth/StudentRegister';
import { NGORegister } from './pages/auth/NGORegister';
import { VerifyOTP } from './pages/auth/VerifyOTP';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { PendingApproval } from './pages/auth/PendingApproval';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';


// Lazy-loaded student pages
const DiscoverCoursesPage = lazy(() => import('./pages/student/DiscoverCoursesPage').then((m) => ({ default: m.DiscoverCoursesPage })));
const NGODirectoryPage = lazy(() => import('./pages/student/NGODirectoryPage').then((m) => ({ default: m.NGODirectoryPage })));
const MyApplicationsPage = lazy(() => import('./pages/student/MyApplicationsPage').then((m) => ({ default: m.MyApplicationsPage })));
const SavedCoursesPage = lazy(() => import('./pages/student/SavedCoursesPage').then((m) => ({ default: m.SavedCoursesPage })));
const StudentInterviewsPage = lazy(() => import('./pages/student/StudentInterviewsPage').then((m) => ({ default: m.StudentInterviewsPage })));
const StudentTrainingPage = lazy(() => import('./pages/student/StudentTrainingPage').then((m) => ({ default: m.StudentTrainingPage })));
const StudentCertificatesPage = lazy(() => import('./pages/student/StudentCertificatesPage').then((m) => ({ default: m.StudentCertificatesPage })));
const StudentMessagesPage = lazy(() => import('./pages/student/StudentMessagesPage').then((m) => ({ default: m.StudentMessagesPage })));
const StudentNotificationsPage = lazy(() => import('./pages/student/StudentNotificationsPage').then((m) => ({ default: m.StudentNotificationsPage })));
const StudentProfilePage = lazy(() => import('./pages/student/StudentProfilePage').then((m) => ({ default: m.StudentProfilePage })));
const StudentSettingsPage = lazy(() => import('./pages/student/StudentSettingsPage').then((m) => ({ default: m.StudentSettingsPage })));


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

// Lazy-loaded NGO pages
const NGODashboardPage = lazy(() => import('./pages/ngo/NGODashboardPage').then((m) => ({ default: m.NGODashboardPage })));
const MyCoursesPage = lazy(() => import('./pages/ngo/MyCoursesPage').then((m) => ({ default: m.MyCoursesPage })));
const StudentApplicationsPage = lazy(() => import('./pages/ngo/StudentApplicationsPage').then((m) => ({ default: m.StudentApplicationsPage })));
const OrganizationProfilePage = lazy(() => import('./pages/ngo/OrganizationProfilePage').then((m) => ({ default: m.OrganizationProfilePage })));
const CreateCoursePage = lazy(() => import('./components/ngo/CreateCourseWizard').then((m) => ({ default: m.CreateCoursePage })));
const InterviewsPage = lazy(() => import('./pages/ngo/InterviewsPage').then((m) => ({ default: m.InterviewsPage })));
const MessagesPage = lazy(() => import('./pages/ngo/MessagesPage').then((m) => ({ default: m.MessagesPage })));
const NGOAnalyticsPage = lazy(() => import('./pages/ngo/NGOAnalyticsPage').then((m) => ({ default: m.NGOAnalyticsPage })));
const NGODocumentsPage = lazy(() => import('./pages/ngo/NGODocumentsPage').then((m) => ({ default: m.NGODocumentsPage })));
const NGONotificationsPage = lazy(() => import('./pages/ngo/NGONotificationsPage').then((m) => ({ default: m.NGONotificationsPage })));
const NGOSettingsPage = lazy(() => import('./pages/ngo/NGOSettingsPage').then((m) => ({ default: m.NGOSettingsPage })));

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullScreenLoader label="Loading admin..." />}>{children}</Suspense>;
}

function NGOSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullScreenLoader label="Loading..." />}>{children}</Suspense>;
}

function StudentSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullScreenLoader label="Loading..." />}>{children}</Suspense>;
}
/**
 * NGO route guard: approved NGOs see their full dashboard; unapproved NGOs
 * see the pending-approval page.
 */
// function NGOApprovedRoute({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();
//   if (loading) return <FullScreenLoader />;
//   if (user?.role !== 'ngo') return <Navigate to="/login" replace />;
//   if (user.verificationStatus !== 'approved') {
//     return <PendingApproval />;
//   }
//   return <>{children}</>;
// }

//changes be me to fixed the issue of ngo approved route so the pending page not come in dashoard route
function NGOApprovedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user?.role !== 'ngo') return <Navigate to="/login" replace />;
  
  // 🟢 FIXED: Safely redirect the browser to a dedicated non-dashboard route
  if (user.verificationStatus !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }
  return <>{children}</>;
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
      {/* Public pages (course/ngo marketing) */}
      <Route path="/programs" element={<AllProgramsPage />} />
      <Route path="/courses/:slug" element={<CourseDetailsPage />} />
      <Route path="/ngos/:slug" element={<NGOPublicProfilePage />} />
      <Route path="/success-stories" element={<SuccessStoriesPage />} />
      <Route path="/contact" element={<ContactSupportPage />} />


    //abbd by me to fix the ngo approved personal page
        {/* 🟢 ADD THIS LINE HERE */}
      <Route path="/pending-approval" element={<PendingApproval />} />

      //Students Routes — Full Dashboard for Students....
      <Route path="/student/dashboard" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentDashboardPage /></RoleRoute></ProtectedRoute>} />
      <Route path="/student/discover" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><DiscoverCoursesPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/ngos" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><NGODirectoryPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><MyApplicationsPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/saved" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><SavedCoursesPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/interviews" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><StudentInterviewsPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/training" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><StudentTrainingPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/certificates" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><StudentCertificatesPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/messages" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><StudentMessagesPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><StudentNotificationsPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><StudentProfilePage /></StudentSuspense></RoleRoute></ProtectedRoute>} />
      <Route path="/student/settings" element={<ProtectedRoute><RoleRoute roles={['student']}><StudentSuspense><StudentSettingsPage /></StudentSuspense></RoleRoute></ProtectedRoute>} />

      {/* NGO Routes — Full Dashboard for Approved NGOs */}
      <Route path="/ngo/dashboard" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><NGODashboardPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/courses" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><MyCoursesPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/courses/create" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><CreateCoursePage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/courses/:id/edit" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><CreateCoursePage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/applications" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><StudentApplicationsPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/interviews" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><InterviewsPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/messages" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><MessagesPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/analytics" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><NGOAnalyticsPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/documents" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><NGODocumentsPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/notifications" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><NGONotificationsPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/settings" element={
        <ProtectedRoute>
          <NGOApprovedRoute>
            <NGOSuspense><NGOSettingsPage /></NGOSuspense>
          </NGOApprovedRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/profile" element={
        <ProtectedRoute>
          <RoleRoute roles={['ngo']}>
            <NGOSuspense><OrganizationProfilePage /></NGOSuspense>
          </RoleRoute>
        </ProtectedRoute>
      } />
      <Route path="/ngo/pending" element={
        <ProtectedRoute>
          <RoleRoute roles={['ngo']}><PendingApproval /></RoleRoute>
        </ProtectedRoute>
      } />

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
