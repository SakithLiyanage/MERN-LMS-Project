import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const TeacherRoute = () => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const location = useLocation();

  // If still loading auth state, show nothing
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not a teacher, redirect to home
  if (user?.role !== 'teacher') {
    return <Navigate to="/" replace />;
  }

  // If authenticated and a teacher, render the child routes
  return <Outlet />;
};

export default TeacherRoute;
