import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Bienvenue ${res.data.user.full_name} !`);

      switch (res.data.user.role) {
        case 'proprietaire': navigate('/dashboard/proprietaire'); break;
        case 'agent': navigate('/dashboard/agent'); break;
        case 'locataire': navigate('/dashboard/locataire'); break;
        case 'admin': navigate('/dashboard/admin'); break;
        default: navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      
      {/* Gauche — Visuel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F4A28] via-[#1A6B3C] to-[#2D9A5F] flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl">🏡</span>
          <span className="font-playfair font-bold text-2xl">Logezy</span>
        </Link>

        <div>
          <h2 className="font-playfair text-4xl font-bold mb-4 leading-tight">
            Trouvez votre<br />
            <span className="text-[#F59E0B]">maison idéale</span><br />
            au Bénin
          </h2>
          <p className="text-white/70 text-lg">
            Des milliers d'annonces vérifiées vous attendent.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '500+', label: 'Annonces' },
            { value: '12', label: 'Villes' },
            { value: '1000+', label: 'Utilisateurs' },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="font-black text-2xl">{s.value}</div>
              <div className="text-white/70 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Droite — Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🏡</span>
            <span className="font-playfair font-bold text-xl text-[#1A6B3C]">Logezy</span>
          </Link>

          <h1 className="font-playfair text-3xl font-bold text-[#0F172A] mb-2">
            Bon retour !
          </h1>
          <p className="text-[#64748B] text-sm mb-8">
            Connectez-vous à votre compte Logezy
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#334155]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Comptes de test */}
          <div className="mt-6 p-4 bg-[#E8F5EE] rounded-xl">
            <p className="text-xs font-bold text-[#1A6B3C] mb-2">🧪 Comptes de test :</p>
            <div className="space-y-1 text-xs text-[#334155]">
              {[
                { role: 'Propriétaire', email: 'proprietaire@test.com' },
                { role: 'Agent', email: 'agent@test.com' },
                { role: 'Locataire', email: 'locataire@test.com' },
                { role: 'Admin', email: 'admin@logezy.bj' },
              ].map((c, i) => (
                <div key={i} className="flex justify-between">
                  <span className="font-medium">{c.role}</span>
                  <span className="text-[#64748B]">{c.email}</span>
                </div>
              ))}
              <p className="text-[#94A3B8] mt-1">⚠️ Ces comptes ont des mots de passe factices — crée un vrai compte d'abord.</p>
            </div>
          </div>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[#1A6B3C] font-bold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}