import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';
import { PortalLogin } from './pages/PortalLogin';
import { ControleAcesso } from './pages/ControleAcesso';
import { GerenciarEstoque } from './pages/GerenciarEstoque';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PortalLogin />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/ativos" replace />} />
              <Route path="/ativos" element={<GerenciarEstoque />} />
              
              <Route element={<AdminRoute />}>
                <Route path="/colaboradores" element={<ControleAcesso />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
