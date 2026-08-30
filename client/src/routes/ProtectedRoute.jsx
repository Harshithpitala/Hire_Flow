import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader fullPage message="Verifying authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};