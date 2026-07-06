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
import { StudentDashboard, NGODashboard, AdminDashboard } from './pages/dashboards/Dashboards';

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
      <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />

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
