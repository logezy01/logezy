import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, MessageSquare, TrendingUp, Home, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import ImageUploader from '../../components/common/ImageUploader';

const MENU = [
  { path: '/dashboard/proprietaire', icon: '📊', label: 'Vue générale' },
  { path: '/dashboard/proprietaire/annonces', icon: '🏠', label: 'Mes annonces' },
  { path: '/dashboard/proprietaire/messages', icon: '💬', label: 'Messages' },
  { path: '/dashboard/proprietaire/publier', icon: '➕', label: 'Publier une annonce' },
];

// ─── VUE GÉNÉRALE ───────────────────────────────────────────
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
        setListings(data.slice(0, 3));
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
      <div className="bg-gradient-to-r from-[#1A6B3C] to-[#2D9A5F] rounded-2xl p-6 text-white">
        <h2 className="font-playfair text-2xl font-bold mb-1">
          Bonjour, {user?.full_name?.split(' ')[0]} 👋
        </h2>
        <p className="text-white/70 text-sm">Voici un résumé de vos activités</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total annonces', value: stats?.total || 0, emoji: '🏠', color: 'border-[#1A6B3C]' },
          { label: 'Annonces actives', value: stats?.active || 0, emoji: '✅', color: 'border-[#10B981]' },
          { label: 'En location', value: stats?.location || 0, emoji: '🔑', color: 'border-[#3B82F6]' },
          { label: 'Total vues', value: stats?.views || 0, emoji: '👁️', color: 'border-[#F59E0B]' },
        ].map((s, i) => (
          <div key={i} className={`card p-5 border-t-4 ${s.color}`}>
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className="font-black text-2xl text-[#0F172A]">{s.value}</div>
            <div className="text-xs text-[#64748B] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Dernières annonces */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#0F172A]">Dernières annonces</h3>
          <Link to="/dashboard/proprietaire/annonces" className="text-sm text-[#1A6B3C] font-medium hover:underline">
            Voir tout →
          </Link>
        </div>
        {listings.length === 0 ? (
          <div className="text-center py-8 text-[#94A3B8]">
            <span className="text-4xl block mb-2">🏠</span>
            <p className="text-sm">Aucune annonce publiée</p>
            <Link to="/dashboard/proprietaire/publier" className="btn-primary inline-block mt-4 text-sm px-4 py-2">
              Publier ma première annonce
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8F5EE] rounded-xl flex items-center justify-center text-lg">🏠</div>
                  <div>
                    <div className="font-medium text-sm text-[#0F172A] line-clamp-1">{l.title}</div>
                    <div className="text-xs text-[#64748B]">{l.city} · {new Intl.NumberFormat('fr-FR').format(l.price)} FCFA</div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  l.status === 'active' ? 'bg-[#E8F5EE] text-[#1A6B3C]' : 'bg-[#FEF3C7] text-yellow-700'
                }`}>
                  {l.status === 'active' ? 'Actif' : l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/dashboard/proprietaire/publier" className="card p-5 flex items-center gap-4 hover:shadow-float transition-shadow group">
          <div className="w-12 h-12 bg-[#E8F5EE] rounded-xl flex items-center justify-center group-hover:bg-[#1A6B3C] transition-colors">
            <Plus size={20} className="text-[#1A6B3C] group-hover:text-white transition-colors" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#0F172A]">Publier une annonce</div>
            <div className="text-xs text-[#64748B]">Ajouter un nouveau bien</div>
          </div>
        </Link>
        <Link to="/dashboard/proprietaire/messages" className="card p-5 flex items-center gap-4 hover:shadow-float transition-shadow group">
          <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center group-hover:bg-[#3B82F6] transition-colors">
            <MessageSquare size={20} className="text-[#3B82F6] group-hover:text-white transition-colors" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#0F172A]">Mes messages</div>
            <div className="text-xs text-[#64748B]">Voir les conversations</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ─── MES ANNONCES ────────────────────────────────────────────
function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/listings/${id}`, { status: newStatus });
      toast.success(`Annonce ${newStatus === 'active' ? 'activée' : 'désactivée'}`);
      fetchListings();
    } catch (e) {
      toast.error('Erreur mise à jour');
    }
  };

  if (loading) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card h-24 animate-pulse bg-[#F8FAFC]" />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#0F172A]">Mes annonces ({listings.length})</h2>
        <Link to="/dashboard/proprietaire/publier" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Plus size={16} /> Nouvelle annonce
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="card p-12 text-center text-[#94A3B8]">
          <span className="text-5xl block mb-3">🏠</span>
          <p className="font-medium mb-4">Aucune annonce publiée</p>
          <Link to="/dashboard/proprietaire/publier" className="btn-primary inline-block text-sm px-6 py-2">
            Publier ma première annonce
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <div key={l.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-4">
              
              {/* Image + infos */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 bg-[#E8F5EE] rounded-xl flex items-center justify-center text-2xl shrink-0">
                  🏠
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#0F172A] truncate">{l.title}</div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    📍 {l.city} {l.neighborhood && `· ${l.neighborhood}`}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    💰 {new Intl.NumberFormat('fr-FR').format(l.price)} FCFA
                    {l.price_period && `/${l.price_period}`}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-[#64748B]">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  {l.views_count || 0} vues
                </div>
                <span className={`font-bold px-2 py-1 rounded-full ${
                  l.status === 'active' ? 'bg-[#E8F5EE] text-[#1A6B3C]' :
                  l.status === 'inactive' ? 'bg-[#F8FAFC] text-[#94A3B8]' :
                  'bg-[#FEF3C7] text-yellow-700'
                }`}>
                  {l.status === 'active' ? '✅ Actif' :
                   l.status === 'inactive' ? '⏸ Inactif' : l.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/annonces/${l.id}`}
                  className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#E8F5EE] text-[#64748B] hover:text-[#1A6B3C] transition-colors"
                  title="Voir"
                >
                  <Eye size={16} />
                </Link>
                <button
                  onClick={() => handleToggleStatus(l.id, l.status)}
                  className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#3B82F6] transition-colors"
                  title={l.status === 'active' ? 'Désactiver' : 'Activer'}
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

// ─── MESSAGES ────────────────────────────────────────────────
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

        {/* Liste conversations */}
        <div className={`w-full md:w-72 border-r border-[#E2E8F0] flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-[#0F172A]">Messages</h3>
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
                      <div className="text-xs text-[#64748B] truncate">{conv.last_message || 'Nouvelle conversation'}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Zone chat */}
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
              {/* Header chat */}
              <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <button onClick={() => setSelected(null)} className="md:hidden p-1 rounded-lg hover:bg-[#F8FAFC]">
                  ←
                </button>
                <div className="w-8 h-8 rounded-full bg-[#1A6B3C] text-white flex items-center justify-center font-bold text-xs">
                  {(selected.buyer_id === user?.id ? selected.owner : selected.buyer)?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0F172A]">
                    {(selected.buyer_id === user?.id ? selected.owner : selected.buyer)?.full_name}
                  </div>
                  {selected.listings && (
                    <div className="text-xs text-[#64748B]">📌 {selected.listings.title}</div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-[#1A6B3C] text-white rounded-br-sm'
                          : 'bg-[#F8FAFC] text-[#0F172A] rounded-bl-sm border border-[#E2E8F0]'
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

              {/* Input message */}
              <form onSubmit={sendMessage} className="p-4 border-t border-[#E2E8F0] flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Écrire un message..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary px-4 py-2">
                  Envoyer
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PUBLIER UNE ANNONCE ──────────────────────────────────────
function PublishListing() {
  const [form, setForm] = useState({
    title: '', description: '', type: 'location', price: '',
    price_period: 'mois', city: '', neighborhood: '', address: '',
    bedrooms: 0, bathrooms: 0, living_rooms: 0, area: '',
    floors: 0, is_furnished: false, has_parking: false,
    has_garden: false, has_pool: false, has_security: false,
  });
  const [loading, setLoading] = useState(false);
  const [createdListingId, setCreatedListingId] = useState(null);
  const navigate = useNavigate();

  const CITIES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Ouidah', 'Lokossa'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/listings', form);
      setCreatedListingId(res.data.listing.id);
      toast.success('Annonce créée ! Ajoutez des photos maintenant.');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur publication');
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Étape 2 — Upload photos
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
              setTimeout(() => navigate('/dashboard/proprietaire/annonces'), 1500);
            }}
          />

          <button
            type="button"
            onClick={() => navigate('/dashboard/proprietaire/annonces')}
            className="btn-ghost w-full py-2.5 mt-3 text-sm"
          >
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
              {[
                { value: 'location', label: '🔑 Location', desc: 'Bien à louer' },
                { value: 'vente', label: '🏷️ Vente', desc: 'Bien à vendre' },
              ].map(t => (
                <button key={t.value} type="button" onClick={() => update('type', t.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    form.type === t.value ? 'border-[#1A6B3C] bg-[#E8F5EE]' : 'border-[#E2E8F0] hover:border-[#1A6B3C]/30'
                  }`}>
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="text-xs text-[#64748B]">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">Titre *</label>
            <input type="text" placeholder="Ex: Villa 3 chambres - Cotonou"
              value={form.title} onChange={(e) => update('title', e.target.value)}
              className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">Description</label>
            <textarea placeholder="Décrivez votre bien en détail..."
              value={form.description} onChange={(e) => update('description', e.target.value)}
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
              { field: 'bathrooms', label: '🚿 Salles de bain' },
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
              <label className="block text-xs text-[#64748B] mb-1">🏢 Nombre d'étages</label>
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
              : '🚀 Créer l\'annonce'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────
export default function DashboardOwner() {
  return (
    <DashboardLayout menuItems={MENU} title="Dashboard Propriétaire">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="annonces" element={<MyListings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="publier" element={<PublishListing />} />
      </Routes>
    </DashboardLayout>
  );
}