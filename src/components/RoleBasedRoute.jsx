import { Navigate } from 'react-router-dom';
import { getUser, isAuthenticated } from '../utils/api';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();
  
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'Admin' || user.role === 'Staff') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/events" replace />;
    }
  }

  return children;
};

export default RoleBasedRoute; 