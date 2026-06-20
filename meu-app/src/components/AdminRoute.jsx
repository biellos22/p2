import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute() {
  const { user } = useAuth();
  
  if (!user || user.funcao !== 'admin') {
    return <Navigate to="/ativos" replace />;
  }

  return <Outlet />;
}
