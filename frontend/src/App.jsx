import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages publiques
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboards
import DashboardOwner from './pages/dashboard/DashboardOwner';
import DashboardAgent from './pages/dashboard/DashboardAgent';
import DashboardTenant from './pages/dashboard/DashboardTenant';
import DashboardAdmin from './pages/dashboard/DashboardAdmin';

// Route protégée
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<Home />} />
      <Route path="/annonces" element={<Listings />} />
      <Route path="/annonces/:id" element={<ListingDetail />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboards protégés */}
      <Route path="/dashboard/proprietaire/*" element={
        <ProtectedRoute roles={['proprietaire']}>
          <DashboardOwner />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/agent/*" element={
        <ProtectedRoute roles={['agent']}>
          <DashboardAgent />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/locataire/*" element={
        <ProtectedRoute roles={['locataire']}>
          <DashboardTenant />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardAdmin />
        </ProtectedRoute>
      } />

      {/* Redirect 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}