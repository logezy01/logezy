import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Users, Home, MessageSquare, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../lib/axios';

const MENU = [
  { path: '/dashboard/admin', icon: '📊', label: 'Vue générale' },
  { path: '/dashboard/admin/utilisateurs', icon: '👥', label: 'Utilisateurs' },
  { path: '/dashboard/admin/annonces', icon: '🏠', label: 'Annonces' },
];

// ─── VUE GÉNÉRALE ────────────────────────────────────────────
function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats);
      } catch (e) {
        toast.error('Erreur chargement statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card h-24 animate-pulse bg-[#F8FAFC]" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#334155] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-bold mb-1">Dashboard Administrateur</h2>
          <p className="text-white/60 text-sm">Vue globale de la plateforme Logezy</p>
        </div>
        <div className="text-5xl">⚙️</div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs', value: stats?.total_users || 0, emoji: '👥', color: 'border-[#3B82F6]', bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]' },
          { label: 'Annonces', value: stats?.total_listings || 0, emoji: '🏠', color: 'border-[#1A6B3C]', bg: 'bg-[#E8F5EE]', text: 'text-[#1A6B3C]' },
          { label: 'Conversations', value: stats?.total_conversations || 0, emoji: '💬', color: 'border-[#F59E0B]', bg: 'bg-[#FEF3C7]', text: 'text-yellow-600' },
          { label: 'Messages', value: stats?.total_messages || 0, emoji: '✉️', color: 'border-[#8B5CF6]', bg: 'bg-purple-50', text: 'text-purple-600' },
        ].map((s, i) => (
          <div key={i} className={`card p-5 border-t-4 ${s.color}`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.emoji}</div>
            <div className={`font-black text-3xl ${s.text}`}>{s.value}</div>
            <div className="text-sm text-[#64748B] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Répartition utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">👥 Utilisateurs par rôle</h3>
          <div className="space-y-3">
            {[
              { role: 'locataire', label: '🔍 Locataires', color: 'bg-[#3B82F6]' },
              { role: 'proprietaire', label: '🏠 Propriétaires', color: 'bg-[#1A6B3C]' },
              { role: 'agent', label: '🤝 Agents', color: 'bg-[#F59E0B]' },
              { role: 'admin', label: '⚙️ Admins', color: 'bg-[#8B5CF6]' },
            ].map(r => {
              const count = stats?.users_by_role?.[r.role] || 0;
              const total = stats?.total_users || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={r.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#334155]">{r.label}</span>
                    <span className="font-bold text-[#0F172A]">{count}</span>
                  </div>
                  <div className="w-full bg-[#F8FAFC] rounded-full h-2">
                    <div className={`${r.color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">🏠 Annonces par type</h3>
          <div className="space-y-3">
            {[
              { key: 'location', label: '🔑 Location', color: 'bg-[#3B82F6]' },
              { key: 'vente', label: '🏷️ Vente', color: 'bg-[#F59E0B]' },
            ].map(t => {
              const count = stats?.listings_by_type?.[t.key] || 0;
              const total = stats?.total_listings || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={t.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#334155]">{t.label}</span>
                    <span className="font-bold text-[#0F172A]">{count}</span>
                  </div>
                  <div className="w-full bg-[#F8FAFC] rounded-full h-2">
                    <div className={`${t.color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}

            <div className="border-t border-[#E2E8F0] pt-3 mt-3">
              <h4 className="text-sm font-medium text-[#334155] mb-2">Par statut</h4>
              {[
                { key: 'active', label: '✅ Actives', color: 'bg-[#1A6B3C]' },
                { key: 'inactive', label: '⏸ Inactives', color: 'bg-[#94A3B8]' },
              ].map(s => {
                const count = stats?.listings_by_status?.[s.key] || 0;
                const total = stats?.total_listings || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={s.key} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[#334155]">{s.label}</span>
                      <span className="font-bold text-[#0F172A]">{count}</span>
                    </div>
                    <div className="w-full bg-[#F8FAFC] rounded-full h-2">
                      <div className={`${s.color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/dashboard/admin/utilisateurs" className="card p-5 flex items-center gap-4 hover:shadow-float transition-shadow group">
          <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-2xl">👥</div>
          <div>
            <div className="font-bold text-sm text-[#0F172A]">Gérer les utilisateurs</div>
            <div className="text-xs text-[#64748B]">Activer, désactiver les comptes</div>
          </div>
          <span className="ml-auto text-[#94A3B8]">→</span>
        </Link>
        <Link to="/dashboard/admin/annonces" className="card p-5 flex items-center gap-4 hover:shadow-float transition-shadow group">
          <div className="w-12 h-12 bg-[#E8F5EE] rounded-xl flex items-center justify-center text-2xl">🏠</div>
          <div>
            <div className="font-bold text-sm text-[#0F172A]">Gérer les annonces</div>
            <div className="text-xs text-[#64748B]">Modérer le contenu</div>
          </div>
          <span className="ml-auto text-[#94A3B8]">→</span>
        </Link>
      </div>
    </div>
  );
}

// ─── UTILISATEURS ─────────────────────────────────────────────
function UsersList()  {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (e) {
      toast.error('Erreur chargement utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (e) {
      toast.error('Erreur mise à jour');
    }
  };

  const ROLE_COLORS = {
    locataire: 'bg-blue-100 text-blue-600',
    proprietaire: 'bg-[#E8F5EE] text-[#1A6B3C]',
    agent: 'bg-[#FEF3C7] text-yellow-700',
    admin: 'bg-purple-100 text-purple-600',
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  if (loading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-[#F8FAFC]" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="font-bold text-[#0F172A]">Utilisateurs ({users.length})</h2>
        <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 gap-1">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'locataire', label: '🔍 Locataires' },
            { value: 'proprietaire', label: '🏠 Propriétaires' },
            { value: 'agent', label: '🤝 Agents' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.value ? 'bg-[#1A6B3C] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {['Utilisateur', 'Rôle', 'Téléphone', 'Inscrit le', 'Statut', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A6B3C] text-white flex items-center justify-center font-bold text-xs">
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-[#0F172A]">{u.full_name}</div>
                        <div className="text-xs text-[#64748B]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{u.phone || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      u.is_active ? 'bg-[#E8F5EE] text-[#1A6B3C]' : 'bg-red-50 text-red-500'
                    }`}>
                      {u.is_active ? '✅ Actif' : '❌ Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(u.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        u.is_active
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-[#E8F5EE] text-[#1A6B3C] hover:bg-[#1A6B3C] hover:text-white'
                      }`}>
                      {u.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ANNONCES ─────────────────────────────────────────────────
function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await api.get('/admin/listings');
      setListings(res.data.listings || []);
    } catch (e) {
      toast.error('Erreur chargement annonces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/admin/listings/${id}/status`, { status });
      toast.success('Statut mis à jour');
      fetchListings();
    } catch (e) {
      toast.error('Erreur mise à jour');
    }
  };

  if (loading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-[#F8FAFC]" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-[#0F172A]">Toutes les annonces ({listings.length})</h2>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {['Annonce', 'Propriétaire', 'Type', 'Prix', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {listings.map(l => (
                <tr key={l.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm text-[#0F172A] max-w-xs truncate">{l.title}</div>
                    <div className="text-xs text-[#64748B]">📍 {l.city} · 👁️ {l.views_count || 0} vues</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#334155]">{l.users?.full_name}</div>
                    <div className="text-xs text-[#64748B]">{l.users?.role}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      l.type === 'location' ? 'bg-blue-100 text-blue-600' : 'bg-[#FEF3C7] text-yellow-700'
                    }`}>
                      {l.type === 'location' ? '🔑 Location' : '🏷️ Vente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#1A6B3C]">
                    {new Intl.NumberFormat('fr-FR').format(l.price)} FCFA
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      l.status === 'active' ? 'bg-[#E8F5EE] text-[#1A6B3C]' : 'bg-red-50 text-red-500'
                    }`}>
                      {l.status === 'active' ? '✅ Actif' : '⏸ Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/annonces/${l.id}`}
                        className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#E8F5EE] text-[#64748B] hover:text-[#1A6B3C] transition-colors"
                        title="Voir">
                        <Eye size={14} />
                      </Link>
                      {l.status === 'active' ? (
                        <button onClick={() => handleStatus(l.id, 'inactive')}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                          title="Désactiver">
                          <XCircle size={14} />
                        </button>
                      ) : (
                        <button onClick={() => handleStatus(l.id, 'active')}
                          className="p-1.5 rounded-lg bg-[#E8F5EE] hover:bg-[#1A6B3C] text-[#1A6B3C] hover:text-white transition-colors"
                          title="Activer">
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────
export default function DashboardAdmin() {
  return (
    <DashboardLayout menuItems={MENU} title="Administration">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="utilisateurs" element={<UsersList />} />
        <Route path="annonces" element={<Listings />} />
      </Routes>
    </DashboardLayout>
  );
}