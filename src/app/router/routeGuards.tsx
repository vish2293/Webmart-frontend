import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { useAuth } from '@/features/auth';

// UX only — the server enforces authentication and authorization on every request.

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (!isAdmin) {
    return (
      <ErrorState
        title="Access denied"
        message="You need an admin account to view this page."
        action={<ButtonLink to="/">Go home</ButtonLink>}
      />
    );
  }
  return <Outlet />;
}
