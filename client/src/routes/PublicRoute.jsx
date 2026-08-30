import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';

export const PublicRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader fullPage message="Loading..." />;
  }

  // If already authenticated, redirect to role-specific dashboard
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
};