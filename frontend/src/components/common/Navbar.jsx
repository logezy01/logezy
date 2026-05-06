import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'proprietaire': return '/dashboard/proprietaire';
      case 'agent': return '/dashboard/agent';
      case 'locataire': return '/dashboard/locataire';
      case 'admin': return '/dashboard/admin';
      default: return '/';
    }
  };

  return (
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🏡</span>
          <span className="font-playfair font-bold text-xl text-[#1A6B3C]">Logezy</span>
        </Link>

        {/* Liens centre */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/annonces" className="text-sm text-[#334155] hover:text-[#1A6B3C] transition-colors">
            Annonces
          </Link>
          <Link to="/annonces?type=location" className="text-sm text-[#334155] hover:text-[#1A6B3C] transition-colors">
            Location
          </Link>
          <Link to="/annonces?type=vente" className="text-sm text-[#334155] hover:text-[#1A6B3C] transition-colors">
            Vente
          </Link>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="flex items-center gap-2 text-sm text-[#334155] hover:text-[#1A6B3C] transition-colors">
                <LayoutDashboard size={16} />
                <span className="hidden md:block">Dashboard</span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E8F5EE]">
                <User size={14} className="text-[#1A6B3C]" />
                <span className="text-sm font-medium text-[#1A6B3C] hidden md:block">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm px-4 py-2">
                Connexion
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}