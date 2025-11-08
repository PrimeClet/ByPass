import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles,children }) => {
  const location = useLocation();

  // Récupère le token depuis le store Redux
  const token = useSelector((state: RootState) => state.user.token);
  const user = useSelector((state: RootState) => state.user.user);

  console.log('Token:', token);

  if(user){
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/requests/new" />
    }
  } else {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  

  if (!token) {
    // Redirection vers la page login avec le return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
