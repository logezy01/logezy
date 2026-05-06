import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import ImageUploader from '../../components/common/ImageUploader';

const MENU = [
  { path: '/dashboard/agent', icon: '📊', label: 'Vue générale' },
  { path: '/dashboard/agent/annonces', icon: '🏠', label: 'Mes annonces' },
  { path: '/dashboard/agent/messages', icon: '💬', label: 'Messages' },
  { path: '/dashboard/agent/publier', icon: '➕', label: 'Publier une annonce' },
];

// ─── VUE GÉNÉRALE ────────────────────────────────────────────
function Overview() {
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/listings/owner/my-listings');
        const data = res.data.listings || [];
        setListings(data.slice(0, 4));
        setStats({
          total: data.length,
          active: data.filter(l => l.status === 'active').length,
          location: data.filter(l => l.type === 'location').length,
          vente: data.filter(l => l.type === 'vente').length,
          views: data.reduce((sum, l) => sum + (l.views_count || 0), 0),
        });
      } catch (e) {
        toast.error('Erreur chargement données');
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

      {/* Bienvenue */}
      <div className="bg-gradient-to-r from-[#0F4A28] to-[#1A6B3C] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-bold mb-1">
            Bonjour, {user?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-white/70 text-sm">Tableau de bord Agent immobilier</p>
        </div>
        <div className="text-5xl">🤝</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total annonces', value: stats?.total || 0, emoji: '🏠', color: 'border-[#1A6B3C]' },
          { label: 'Actives', value: stats?.active || 0, emoji: '✅', color: 'border-[#10B981]' },
          { label: 'Locations', value: stats?.location || 0, emoji: '🔑', color: 'border-[#3B82F6]' },
          { label: 'Ventes', value: stats?.vente || 0, emoji: '🏷️', color: 'border-[#F59E0B]' },
          { label: 'Total vues', value: stats?.views || 0, emoji: '👁️', color: 'border-[#8B5CF6]' },
        ].map((s, i) => (
          <div key={i} className={`card p-4 border-t-4 ${s.color} text-center`}>
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="font-black text-2xl text-[#0F172A]">{s.value}</div>
            <div className="text-xs text-[#64748B] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Annonces récentes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#0F172A]">Annonces récentes</h3>
          <Link to="/dashboard/agent/annonces" className="text-sm text-[#1A6B3C] font-medium hover:underline">
            Voir tout →
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-8 text-[#94A3B8]">
            <span className="text-4xl block mb-2">🏠</span>
            <p className="text-sm mb-4">Aucune annonce publiée</p>
            <Link to="/dashboard/agent/publier" className="btn-primary inline-block text-sm px-4 py-2">
              Publier ma première annonce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {listings.map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                <div className="w-10 h-10 bg-[#E8F5EE] rounded-xl flex items-center justify-center text-lg shrink-0">🏠</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[#0F172A] truncate">{l.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#64748B]">{l.city}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      l.type === 'location' ? 'bg-blue-100 text-blue-600' : 'bg-[#FEF3C7] text-yellow-700'
                    }`}>
                      {l.type === 'location' ? 'Location' : 'Vente'}
                    </span>
                  </div>
                </div>
                <div className="text-xs font-bold text-[#1A6B3C]">
                  {new Intl.NumberFormat('fr-FR').format(l.price)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/agent/publier', icon: '➕', label: 'Nouvelle annonce', desc: 'Ajouter un bien', bg: 'bg-[#E8F5EE]', color: 'text-[#1A6B3C]' },
          { to: '/dashboard/agent/annonces', icon: '🏠', label: 'Mes annonces', desc: 'Gérer le portefeuille', bg: 'bg-[#EFF6FF]', color: 'text-[#3B82F6]' },
          { to: '/dashboard/agent/messages', icon: '💬', label: 'Messages', desc: 'Voir les conversations', bg: 'bg-[#FEF3C7]', color: 'text-yellow-600' },
        ].map((a, i) => (
          <Link key={i} to={a.to} className="card p-5 flex items-center gap-4 hover:shadow-float transition-shadow group">
            <div className={`w-12 h-12 ${a.bg} rounded-xl flex items-center justify-center text-2xl`}>
              {a.icon}
            </div>
            <div>
              <div className="font-bold text-sm text-[#0F172A]">{a.label}</div>
              <div className="text-xs text-[#64748B]">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── MES ANNONCES ─────────────────────────────────────────────
function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchListings = async () => {
    try {
      const res = await api.get('/listings/owner/my-listings');
      setListings(res.data.listings || []);
    } catch (e) {
      toast.error('Erreur chargement annonces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Annonce supprimée');
      fetchListings();
    } catch (e) {
      toast.error('Erreur suppression');
    }
  };

  const handleToggle = async (id, status) => {
    try {
      await api.put(`/listings/${id}`, { status: status === 'active' ? 'inactive' : 'active' });
      toast.success('Statut mis à jour');
      fetchListings();
    } catch (e) {
      toast.error('Erreur mise à jour');
    }
  };

  const filtered = filter === 'all' ? listings
    : filter === 'location' ? listings.filter(l => l.type === 'location')
    : filter === 'vente' ? listings.filter(l => l.type === 'vente')
    : listings.filter(l => l.status === filter);

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card h-24 animate-pulse bg-[#F8FAFC]" />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="font-bold text-[#0F172A]">Portefeuille d'annonces ({listings.length})</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtres */}
          <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 gap-1">
            {[
              { value: 'all', label: 'Tout' },
              { value: 'active', label: '✅ Actives' },
              { value: 'location', label: '🔑 Location' },
              { value: 'vente', label: '🏷️ Vente' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.value
                    ? 'bg-[#1A6B3C] text-white'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Link to="/dashboard/agent/publier" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
            <Plus size={14} /> Nouvelle
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-[#94A3B8]">
          <span className="text-5xl block mb-3">🏠</span>
          <p className="font-medium mb-4">Aucune annonce dans cette catégorie</p>
          <Link to="/dashboard/agent/publier" className="btn-primary inline-block text-sm px-6 py-2">
            Publier une annonce
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(l => (
            <div key={l.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 bg-[#E8F5EE] rounded-xl flex items-center justify-center text-2xl shrink-0">🏠</div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#0F172A] truncate">{l.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-[#64748B]">📍 {l.city}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      l.type === 'location' ? 'bg-blue-100 text-blue-600' : 'bg-[#FEF3C7] text-yellow-700'
                    }`}>
                      {l.type === 'location' ? '🔑 Location' : '🏷️ Vente'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      l.status === 'active' ? 'bg-[#E8F5EE] text-[#1A6B3C]' : 'bg-[#F8FAFC] text-[#94A3B8]'
                    }`}>
                      {l.status === 'active' ? '✅ Actif' : '⏸ Inactif'}
                    </span>
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    💰 {new Intl.NumberFormat('fr-FR').format(l.price)} FCFA
                    {l.price_period && `/${l.price_period}`}
                    &nbsp;·&nbsp;👁️ {l.views_count || 0} vues
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/annonces/${l.id}`}
                  className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#E8F5EE] text-[#64748B] hover:text-[#1A6B3C] transition-colors"
                  title="Voir l'annonce"
                >
                  <Eye size={16} />
                </Link>
                <button
                  onClick={() => handleToggle(l.id, l.status)}
                  className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#3B82F6] transition-colors"
                  title="Activer / Désactiver"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-red-50 text-[#64748B] hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MESSAGES ─────────────────────────────────────────────────
function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data.conversations || []);
      } catch (e) {
        toast.error('Erreur chargement conversations');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const openConversation = async (conv) => {
    setSelected(conv);
    try {
      const res = await api.get(`/chat/conversations/${conv.id}/messages`);
      setMessages(res.data.messages || []);
    } catch (e) {
      toast.error('Erreur chargement messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      const res = await api.post(`/chat/conversations/${selected.id}/messages`, { content: newMsg });
      setMessages(prev => [...prev, res.data.message]);
      setNewMsg('');
    } catch (e) {
      toast.error('Erreur envoi message');
    }
  };

  if (loading) return <div className="card h-64 animate-pulse bg-[#F8FAFC]" />;

  return (
    <div className="card overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
      <div className="flex h-full">
        <div className={`w-full md:w-72 border-r border-[#E2E8F0] flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-[#0F172A]">Conversations ({conversations.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-[#94A3B8]">
                <span className="text-4xl block mb-2">💬</span>
                <p className="text-sm">Aucune conversation</p>
              </div>
            ) : (
              conversations.map(conv => {
                const other = conv.buyer_id === user?.id ? conv.owner : conv.buyer;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-[#F8FAFC] transition-colors text-left border-b border-[#E2E8F0] ${
                      selected?.id === conv.id ? 'bg-[#E8F5EE]' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1A6B3C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {other?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-[#0F172A] truncate">{other?.full_name}</div>
                      <div className="text-xs text-[#64748B] truncate mt-0.5">{conv.last_message || 'Nouvelle conversation'}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${selected ? 'flex' : 'hidden md:flex'}`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-[#94A3B8]">
              <div className="text-center">
                <span className="text-5xl block mb-3">💬</span>
                <p className="text-sm">Sélectionnez une conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <button onClick={() => setSelected(null)} className="md:hidden p-1 rounded-lg hover:bg-[#F8FAFC] text-[#64748B]">←</button>
                <div className="w-8 h-8 rounded-full bg-[#1A6B3C] text-white flex items-center justify-center font-bold text-xs">
                  {(selected.buyer_id === user?.id ? selected.owner : selected.buyer)?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm">{(selected.buyer_id === user?.id ? selected.owner : selected.buyer)?.full_name}</div>
                  {selected.listings && <div className="text-xs text-[#64748B]">📌 {selected.listings.title}</div>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        isMe ? 'bg-[#1A6B3C] text-white rounded-br-sm' : 'bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-bl-sm'
                      }`}>
                        {msg.content}
                        <div className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-[#94A3B8]'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t border-[#E2E8F0] flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Écrire un message..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary px-4 py-2">Envoyer</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PUBLIER ──────────────────────────────────────────────────
function PublishListing() {
  const [form, setForm] = useState({
    title: '', description: '', type: 'location', price: '',
    price_period: 'mois', city: '', neighborhood: '',
    bedrooms: 0, bathrooms: 0, living_rooms: 0, area: '',
    floors: 0, is_furnished: false, has_parking: false,
    has_garden: false, has_pool: false, has_security: false,
  });
  const [loading, setLoading] = useState(false);
    const [createdListingId, setCreatedListingId] = useState(null);
    const navigate = useNavigate();
  const CITIES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Ouidah', 'Lokossa'];
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/listings', form);
      setCreatedListingId(res.data.listing.id);
      toast.success('Annonce créée ! Ajoutez des photos.');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur publication');
    } finally {
      setLoading(false);
    }
  };

  if (createdListingId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-6">
          <div className="text-center mb-6">
            <span className="text-5xl block mb-3">🎉</span>
            <h2 className="font-playfair text-2xl font-bold text-[#0F172A]">Annonce créée !</h2>
            <p className="text-sm text-[#64748B] mt-1">Ajoutez des photos pour attirer plus de visiteurs</p>
          </div>
          <ImageUploader
            listingId={createdListingId}
            onUploadComplete={() => {
              setTimeout(() => navigate('/dashboard/agent/annonces'), 1500);
            }}
          />
          <button type="button" onClick={() => navigate('/dashboard/agent/annonces')}
            className="btn-ghost w-full py-2.5 mt-3 text-sm">
            Passer cette étape →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-6">Publier une annonce</h2>
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">Type d'annonce</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: 'location', label: '🔑 Location' }, { value: 'vente', label: '🏷️ Vente' }].map(t => (
                <button key={t.value} type="button" onClick={() => update('type', t.value)}
                  className={`p-3 rounded-xl border-2 text-left font-bold text-sm transition-all ${
                    form.type === t.value ? 'border-[#1A6B3C] bg-[#E8F5EE]' : 'border-[#E2E8F0] hover:border-[#1A6B3C]/30'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">Titre *</label>
            <input type="text" placeholder="Ex: Villa 3 chambres - Cotonou" value={form.title}
              onChange={(e) => update('title', e.target.value)} className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">Description</label>
            <textarea placeholder="Décrivez le bien..." value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="input-field min-h-[100px] resize-none" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">Prix (FCFA) *</label>
              <input type="number" placeholder="Ex: 150000" value={form.price}
                onChange={(e) => update('price', e.target.value)} className="input-field" required />
            </div>
            {form.type === 'location' && (
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-2">Période</label>
                <select value={form.price_period} onChange={(e) => update('price_period', e.target.value)} className="input-field">
                  <option value="mois">Par mois</option>
                  <option value="an">Par an</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">Ville *</label>
              <select value={form.city} onChange={(e) => update('city', e.target.value)} className="input-field" required>
                <option value="">Choisir une ville</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">Quartier</label>
              <input type="text" placeholder="Ex: Cadjehoun" value={form.neighborhood}
                onChange={(e) => update('neighborhood', e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { field: 'bedrooms', label: '🛏 Chambres' },
              { field: 'bathrooms', label: '🚿 SDB' },
              { field: 'living_rooms', label: '🛋 Salons' },
            ].map(f => (
              <div key={f.field}>
                <label className="block text-xs text-[#64748B] mb-1">{f.label}</label>
                <input type="number" min="0" value={form[f.field]}
                  onChange={(e) => update(f.field, parseInt(e.target.value))}
                  className="input-field text-center" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#64748B] mb-1">📐 Superficie (m²)</label>
              <input type="number" placeholder="Ex: 120" value={form.area}
                onChange={(e) => update('area', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-[#64748B] mb-1">🏢 Étages</label>
              <input type="number" min="0" value={form.floors}
                onChange={(e) => update('floors', parseInt(e.target.value))} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-3">Équipements</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { field: 'is_furnished', label: '🛋 Meublé' },
                { field: 'has_parking', label: '🚗 Parking' },
                { field: 'has_garden', label: '🌿 Jardin' },
                { field: 'has_pool', label: '🏊 Piscine' },
                { field: 'has_security', label: '🔒 Sécurité' },
              ].map(f => (
                <label key={f.field} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form[f.field] ? 'border-[#1A6B3C] bg-[#E8F5EE]' : 'border-[#E2E8F0]'
                }`}>
                  <input type="checkbox" checked={form[f.field]}
                    onChange={(e) => update(f.field, e.target.checked)} className="hidden" />
                  <span className="text-sm font-medium">{f.label}</span>
                  {form[f.field] && <span className="ml-auto text-[#1A6B3C] text-xs font-bold">✓</span>}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : '🚀 Publier l\'annonce'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────
export default function DashboardAgent() {
  return (
    <DashboardLayout menuItems={MENU} title="Dashboard Agent">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="annonces" element={<MyListings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="publier" element={<PublishListing />} />
      </Routes>
    </DashboardLayout>
  );
}