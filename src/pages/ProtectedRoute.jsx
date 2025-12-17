import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/FakeAuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the location they were trying to access for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;