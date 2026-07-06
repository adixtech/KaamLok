import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullScreenLoader } from '../ui/Loading';
import type { Role } from '../../types/auth';

/**
 * Protects a route — only authenticated users may pass.
 * While the session is being restored, a full-screen loader is shown.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader label="Restoring your session..." />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

/**
 * Restricts a route to specific roles. Unauthenticated users are sent to
 * login; authenticated users with the wrong role are sent to their own
 * dashboard so they never see a dead-end 403.
 */
export function RoleRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader label="Checking access..." />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!roles.includes(user.role)) {
    const home = `/${user.role}/dashboard`;
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}

/**
 * Inverse of ProtectedRoute — redirects authenticated users away from
 * public-only pages (login, register, get-started) to their dashboard.
 */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader label="Loading..." />;
  if (user) {
    const home =
      user.role === 'ngo' && user.verificationStatus !== 'approved'
        ? '/ngo/pending'
        : `/${user.role}/dashboard`;
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}
