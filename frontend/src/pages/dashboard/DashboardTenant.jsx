import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Search, Heart, MessageSquare, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/common/DashboardLayout';
import ListingCard from '../../components/common/ListingCard';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';

const MENU = [
  { path: '/dashboard/locataire', icon: '📊', label: 'Vue générale' },
  { path: '/dashboard/locataire/recherche', icon: '🔍', label: 'Rechercher' },
  { path: '/dashboard/locataire/favoris', icon: '❤️', label: 'Mes favoris' },
  { path: '/dashboard/locataire/messages', icon: '💬', label: 'Messages' },
];

// ─── VUE GÉNÉRALE ────────────────────────────────────────────
function Overview() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/listings?limit=3');
        setListings(res.data.listings || []);
      } catch (e) {
        toast.error('Erreur chargement');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">

      {/* Bienvenue */}
      <div className="bg-gradient-to-r from-[#1A6B3C] to-[#2D9A5F] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-bold mb-1">
            Bonjour, {user?.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-white/70 text-sm">Trouvez votre maison idéale au Bénin</p>
        </div>
        <div className="text-5xl">🔍</div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/locataire/recherche', icon: '🔍', label: 'Rechercher', desc: 'Trouver un bien', bg: 'bg-[#E8F5EE]' },
          { to: '/dashboard/locataire/favoris', icon: '❤️', label: 'Mes favoris', desc: 'Biens sauvegardés', bg: 'bg-red-50' },
          { to: '/dashboard/locataire/messages', icon: '💬', label: 'Messages', desc: 'Mes conversations', bg: 'bg-[#EFF6FF]' },
        ].map((a, i) => (
          <Link key={i} to={a.to} className="card p-5 flex items-center gap-4 hover:shadow-float transition-shadow">
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

      {/* Annonces récentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#0F172A]">Annonces récentes</h3>
          <Link to="/annonces" className="text-sm text-[#1A6B3C] font-medium hover:underline">
            Voir tout →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-[#F8FAFC]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>

      {/* Conseil */}
      <div className="card p-5 bg-[#FEF3C7] border-[#F59E0B]/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="font-bold text-sm text-[#92400E] mb-1">Conseil Logezy</div>
            <p className="text-xs text-[#92400E]/80 leading-relaxed">
              Utilisez les filtres de recherche avancée pour trouver exactement ce que vous cherchez.
              Vous pouvez filtrer par ville, nombre de chambres, superficie et prix.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RECHERCHE ────────────────────────────────────────────────
function Search_() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: '', type: '', bedrooms: '', min_price: '', max_price: ''
  });

  const CITIES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Ouidah', 'Lokossa'];

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data.listings || []);
    } catch (e) {
      toast.error('Erreur recherche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { handleSearch(); }, []);

  const update = (f, v) => setFilters(p => ({ ...p, [f]: v }));

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-[#0F172A]">Recherche avancée</h2>

      {/* Filtres */}
      <form onSubmit={handleSearch} className="card p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] mb-1">Ville</label>
            <select value={filters.city} onChange={(e) => update('city', e.target.value)} className="input-field">
              <option value="">Toutes les villes</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#334155] mb-1">Type</label>
            <select value={filters.type} onChange={(e) => update('type', e.target.value)} className="input-field">
              <option value="">Tout type</option>
              <option value="location">Location</option>
              <option value="vente">Vente</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#334155] mb-1">Chambres min.</label>
            <select value={filters.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="input-field">
              <option value="">Peu importe</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#334155] mb-1">Prix min (FCFA)</label>
            <input type="number" placeholder="Ex: 50000" value={filters.min_price}
              onChange={(e) => update('min_price', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#334155] mb-1">Prix max (FCFA)</label>
            <input type="number" placeholder="Ex: 500000" value={filters.max_price}
              onChange={(e) => update('max_price', e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              🔍 Rechercher
            </button>
          </div>
        </div>
      </form>

      {/* Résultats */}
      <div>
        <p className="text-sm text-[#64748B] mb-4">{listings.length} résultat(s) trouvé(s)</p>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-[#F8FAFC]" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="card p-12 text-center text-[#94A3B8]">
            <span className="text-5xl block mb-3">🔍</span>
            <p className="font-medium">Aucun résultat trouvé</p>
            <p className="text-sm mt-1">Essayez d'élargir vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FAVORIS ──────────────────────────────────────────────────
function Favorites() {
  return (
    <div className="space-y-4">
      <h2 className="font-bold text-[#0F172A]">Mes favoris</h2>
      <div className="card p-12 text-center text-[#94A3B8]">
        <span className="text-5xl block mb-3">❤️</span>
        <p className="font-medium">Aucun favori pour le moment</p>
        <p className="text-sm mt-1 mb-4">Sauvegardez des annonces pour les retrouver ici</p>
        <Link to="/annonces" className="btn-primary inline-block text-sm px-6 py-2">
          Parcourir les annonces
        </Link>
      </div>
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
            <h3 className="font-bold text-[#0F172A]">Mes conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-[#94A3B8]">
                <span className="text-4xl block mb-2">💬</span>
                <p className="text-sm">Aucune conversation</p>
                <p className="text-xs mt-1">Contactez un propriétaire depuis une annonce</p>
              </div>
            ) : (
              conversations.map(conv => {
                const other = conv.buyer_id === user?.id ? conv.owner : conv.buyer;
                return (
                  <button key={conv.id} onClick={() => openConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-[#F8FAFC] transition-colors text-left border-b border-[#E2E8F0] ${selected?.id === conv.id ? 'bg-[#E8F5EE]' : ''}`}>
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
                <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Écrire un message..." className="input-field flex-1" />
                <button type="submit" className="btn-primary px-4 py-2">Envoyer</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────
export default function DashboardTenant() {
  return (
    <DashboardLayout menuItems={MENU} title="Dashboard Locataire">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="recherche" element={<Search_ />} />
        <Route path="favoris" element={<Favorites />} />
        <Route path="messages" element={<Messages />} />
      </Routes>
    </DashboardLayout>
  );
}