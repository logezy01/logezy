import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Maximize, Home, Shield,
  Car, Trees, Waves, ChevronLeft, MessageSquare, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import api from '../lib/axios';
import useAuthStore from '../store/authStore';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data.listing);
      } catch (e) {
        toast.error('Annonce introuvable');
        navigate('/annonces');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleContact = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour contacter le propriétaire');
      navigate('/login');
      return;
    }
    if (user?.id === listing?.owner_id) {
      toast.error('Vous ne pouvez pas vous contacter vous-même');
      return;
    }
    setContacting(true);
    try {
      const res = await api.post('/chat/conversations', {
        listing_id: listing.id,
        owner_id: listing.owner_id,
      });
      toast.success('Conversation ouverte !');

    toast.success('Conversation ouverte ! Allez dans vos messages.');
setTimeout(() => {
  switch (user?.role) {
    case 'proprietaire': navigate('/dashboard/proprietaire/messages'); break;
    case 'agent': navigate('/dashboard/agent/messages'); break;
    case 'locataire': navigate('/dashboard/locataire/messages'); break;
    default: navigate('/');
  }
}, 1000);
    } catch (e) {
      toast.error('Erreur lors de la mise en contact');
    } finally {
      setContacting(false);
    }
  };

  const formatPrice = (price, period) => {
    const formatted = new Intl.NumberFormat('fr-FR').format(price);
    return period ? `${formatted} FCFA/${period}` : `${formatted} FCFA`;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <div className="card h-80 animate-pulse bg-white" />
        <div className="card h-40 animate-pulse bg-white" />
      </div>
    </div>
  );

  if (!listing) return null;

  const images = listing.listing_images || [];
  const coverImage = images.find(i => i.is_cover)?.image_url;

  const EQUIPMENTS = [
    { key: 'is_furnished', label: 'Meublé', icon: '🛋' },
    { key: 'has_parking', label: 'Parking', icon: '🚗' },
    { key: 'has_garden', label: 'Jardin', icon: '🌿' },
    { key: 'has_pool', label: 'Piscine', icon: '🏊' },
    { key: 'has_security', label: 'Sécurité', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
          <Link to="/annonces" className="flex items-center gap-1 hover:text-[#1A6B3C] transition-colors">
            <ChevronLeft size={16} /> Annonces
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] font-medium truncate">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-4">

            {/* Image principale */}
            <div className="card overflow-hidden">
              <div className="relative h-72 bg-gradient-to-br from-[#E8F5EE] to-[#DBEAFE]">
                {coverImage ? (
                  <img src={`http://localhost:5000${coverImage}`} alt={listing.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl">🏠</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                    listing.type === 'location' ? 'bg-blue-100 text-blue-600' : 'bg-[#FEF3C7] text-yellow-700'
                  }`}>
                    {listing.type === 'location' ? '🔑 Location' : '🏷️ Vente'}
                  </span>
                  {listing.users?.is_verified && (
                    <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-white text-[#1A6B3C]">
                      ✓ Vérifié
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="card overflow-hidden">
              <div className="flex border-b border-[#E2E8F0]">
                {[
                  { key: 'info', label: 'Informations' },
                  { key: 'equipments', label: 'Équipements' },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'text-[#1A6B3C] border-b-2 border-[#1A6B3C]'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'info' && (
                  <div className="space-y-5">
                    <div>
                      <h1 className="font-playfair text-2xl font-bold text-[#0F172A] mb-2">
                        {listing.title}
                      </h1>
                      <div className="flex items-center gap-1 text-[#64748B] text-sm">
                        <MapPin size={14} />
                        {listing.neighborhood && `${listing.neighborhood}, `}{listing.city}
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: listing.bedrooms, label: 'Chambres', icon: '🛏' },
                        { value: listing.bathrooms, label: 'Salles de bain', icon: '🚿' },
                        { value: listing.living_rooms, label: 'Salons', icon: '🛋' },
                        { value: listing.area ? `${listing.area}m²` : '—', label: 'Superficie', icon: '📐' },
                      ].map((s, i) => (
                        <div key={i} className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                          <div className="text-xl mb-1">{s.icon}</div>
                          <div className="font-black text-lg text-[#0F172A]">{s.value || '—'}</div>
                          <div className="text-xs text-[#64748B]">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {listing.description && (
                      <div>
                        <h3 className="font-bold text-[#0F172A] mb-2">Description</h3>
                        <p className="text-sm text-[#64748B] leading-relaxed">{listing.description}</p>
                      </div>
                    )}

                    {listing.floors > 0 && (
                      <div className="flex items-center gap-2 text-sm text-[#64748B]">
                        <span>🏢</span>
                        <span>{listing.floors} étage(s)</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'equipments' && (
                  <div>
                    <h3 className="font-bold text-[#0F172A] mb-4">Équipements disponibles</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {EQUIPMENTS.map(eq => (
                        <div key={eq.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                          listing[eq.key]
                            ? 'border-[#1A6B3C] bg-[#E8F5EE]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC] opacity-50'
                        }`}>
                          <span className="text-xl">{eq.icon}</span>
                          <span className={`text-sm font-medium ${
                            listing[eq.key] ? 'text-[#1A6B3C]' : 'text-[#94A3B8]'
                          }`}>
                            {eq.label}
                          </span>
                          {listing[eq.key] && <span className="ml-auto text-[#1A6B3C] text-xs">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-4">

            {/* Prix + Contact */}
            <div className="card p-5 sticky top-20">
              <div className="mb-4">
                <div className="font-black text-3xl text-[#1A6B3C]">
                  {formatPrice(listing.price, listing.price_period)}
                </div>
                {listing.type === 'location' && (
                  <div className="text-xs text-[#64748B] mt-1">par {listing.price_period || 'mois'}</div>
                )}
              </div>

              <button onClick={handleContact} disabled={contacting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mb-3">
                {contacting
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><MessageSquare size={16} /> Contacter le propriétaire</>
                }
              </button>

              {listing.users?.phone && (
                <a href={`tel:${listing.users.phone}`}
                  className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
                  <Phone size={16} /> {listing.users.phone}
                </a>
              )}

              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Shield size={14} className="text-[#1A6B3C]" />
                  <span>Annonce vérifiée par Logezy</span>
                </div>
              </div>
            </div>

            {/* Propriétaire */}
            <div className="card p-5">
              <h3 className="font-bold text-sm text-[#0F172A] mb-3">Publié par</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A6B3C] text-white flex items-center justify-center font-bold text-lg">
                  {listing.users?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0F172A]">{listing.users?.full_name}</div>
                  {listing.users?.is_verified && (
                    <span className="text-xs text-[#1A6B3C] font-medium">✓ Vérifié</span>
                  )}
                </div>
              </div>
            </div>

            {/* Infos rapides */}
            <div className="card p-5">
              <h3 className="font-bold text-sm text-[#0F172A] mb-3">Résumé</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Type', value: listing.type === 'location' ? '🔑 Location' : '🏷️ Vente' },
                  { label: 'Ville', value: `📍 ${listing.city}` },
                  { label: 'Vues', value: `👁️ ${listing.views_count || 0}` },
                  { label: 'Publié le', value: new Date(listing.created_at).toLocaleDateString('fr-FR') },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[#64748B]">{item.label}</span>
                    <span className="font-medium text-[#0F172A]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}