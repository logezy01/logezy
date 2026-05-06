import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';

const ROLES = [
  {
    value: 'locataire',
    emoji: '🔍',
    label: 'Locataire / Acheteur',
    desc: 'Je cherche une maison à louer ou à acheter',
  },
  {
    value: 'proprietaire',
    emoji: '🏠',
    label: 'Propriétaire',
    desc: 'Je veux publier mes biens immobiliers',
  },
  {
    value: 'agent',
    emoji: '🤝',
    label: 'Agent immobilier',
    desc: 'Je gère des biens pour plusieurs propriétaires',
  },
];

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) {
      toast.error('Veuillez choisir un type de compte');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success('Compte créé avec succès ! 🎉');

      switch (res.data.user.role) {
        case 'proprietaire': navigate('/dashboard/proprietaire'); break;
        case 'agent': navigate('/dashboard/agent'); break;
        case 'locataire': navigate('/dashboard/locataire'); break;
        default: navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la création du compte');
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
            Rejoignez<br />
            <span className="text-[#F59E0B]">la communauté</span><br />
            Logezy
          </h2>
          <p className="text-white/70 text-lg">
            Plus de 1000 utilisateurs nous font déjà confiance.
          </p>
        </div>

        <div className="space-y-3">
          {ROLES.map((role) => (
            <div key={role.value} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <span className="text-2xl">{role.emoji}</span>
              <div>
                <div className="font-bold text-sm">{role.label}</div>
                <div className="text-white/60 text-xs">{role.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Droite — Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🏡</span>
            <span className="font-playfair font-bold text-xl text-[#1A6B3C]">Logezy</span>
          </Link>

          <h1 className="font-playfair text-3xl font-bold text-[#0F172A] mb-2">
            Créer un compte
          </h1>
          <p className="text-[#64748B] text-sm mb-8">
            Rejoignez Logezy gratuitement
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Choix du rôle */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-3">
                Je suis...
              </label>
              <div className="space-y-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      form.role === role.value
                        ? 'border-[#1A6B3C] bg-[#E8F5EE]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#1A6B3C]/30'
                    }`}
                  >
                    <span className="text-xl">{role.emoji}</span>
                    <div>
                      <div className="font-bold text-sm text-[#0F172A]">{role.label}</div>
                      <div className="text-xs text-[#64748B]">{role.desc}</div>
                    </div>
                    {form.role === role.value && (
                      <span className="ml-auto text-[#1A6B3C] font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">Nom complet</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">Email</label>
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

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">
                Téléphone <span className="text-[#94A3B8]">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="tel"
                  placeholder="+229 97 00 00 00"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 caractères"
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
              ) : 'Créer mon compte →'}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-[#1A6B3C] font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}