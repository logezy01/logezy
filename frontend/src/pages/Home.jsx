import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Shield, Star } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import ListingCard from '../components/common/ListingCard';
import api from '../lib/axios';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings?limit=6');
        setListings(res.data.listings || []);
      } catch (error) {
        console.error('Erreur chargement annonces:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchType) params.append('type', searchType);
    navigate(`/annonces?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0F4A28] via-[#1A6B3C] to-[#2D9A5F] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🇧🇯</span>
            <span>N°1 de l'immobilier au Bénin</span>
          </div>

          <h1 className="font-playfair text-4xl md:text-6xl font-black mb-4 leading-tight">
            Votre maison,<br />
            <span className="text-[#F59E0B]">en toute confiance.</span>
          </h1>

          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Trouvez la maison de vos rêves au Bénin. Des milliers d'annonces vérifiées à louer ou à acheter.
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center gap-2 flex-1 px-3">
              <MapPin size={18} className="text-[#94A3B8] shrink-0" />
              <input
                type="text"
                placeholder="Ville (ex: Cotonou, Porto-Novo...)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="flex-1 text-[#0F172A] text-sm outline-none py-2 placeholder-[#94A3B8]"
              />
            </div>

            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="text-sm text-[#334155] px-3 py-2 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#1A6B3C] md:w-36"
            >
              <option value="">Tout type</option>
              <option value="location">Location</option>
              <option value="vente">Vente</option>
            </select>

            <button type="submit" className="btn-primary flex items-center gap-2 justify-center px-6">
              <Search size={16} />
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-[#E2E8F0] py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '500+', label: 'Annonces actives', emoji: '🏠' },
            { value: '12', label: 'Villes couvertes', emoji: '📍' },
            { value: '1000+', label: 'Utilisateurs', emoji: '👥' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="font-black text-2xl text-[#1A6B3C]">{stat.value}</div>
              <div className="text-xs text-[#64748B]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ANNONCES RÉCENTES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-playfair text-3xl font-bold text-[#0F172A]">Annonces récentes</h2>
            <p className="text-[#64748B] text-sm mt-1">Les dernières propriétés disponibles</p>
          </div>
          <Link to="/annonces" className="btn-secondary text-sm px-4 py-2">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-[#F8FAFC]" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#94A3B8]">
            <span className="text-5xl block mb-4">🏠</span>
            <p>Aucune annonce disponible pour le moment.</p>
          </div>
        )}
      </section>

      {/* POURQUOI LOGEZY */}
      <section className="bg-white py-16 px-6 border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-3xl font-bold text-[#0F172A] mb-2">Pourquoi choisir Logezy ?</h2>
          <p className="text-[#64748B] mb-12">La plateforme immobilière de confiance au Bénin</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="text-[#1A6B3C]" size={28} />, title: 'Annonces vérifiées', desc: 'Chaque annonce est contrôlée par notre équipe pour garantir la fiabilité.' },
              { icon: <Search className="text-[#1A6B3C]" size={28} />, title: 'Recherche avancée', desc: 'Filtrez par ville, prix, nombre de chambres, superficie et bien plus.' },
              { icon: <TrendingUp className="text-[#1A6B3C]" size={28} />, title: 'Marché transparent', desc: 'Accédez aux prix du marché et prenez des décisions éclairées.' },
            ].map((item, i) => (
              <div key={i} className="card p-6 text-left hover:shadow-float transition-shadow">
                <div className="w-12 h-12 bg-[#E8F5EE] rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PUBLIER */}
      <section className="bg-gradient-to-r from-[#1A6B3C] to-[#2D9A5F] py-16 px-6 text-white text-center">
        <h2 className="font-playfair text-3xl font-bold mb-3">Vous avez un bien à louer ou à vendre ?</h2>
        <p className="text-white/80 mb-8 max-w-lg mx-auto">Publiez votre annonce gratuitement et touchez des milliers d'acheteurs et locataires potentiels.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-[#F59E0B] text-white font-bold px-8 py-4 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg">
          Publier une annonce →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0F172A] text-white py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="font-playfair font-bold text-xl text-[#1A6B3C]">Logezy</span>
          </div>
          <p className="text-[#64748B] text-sm">© 2026 Logezy — Tous droits réservés. Made in Bénin 🇧🇯</p>
          <div className="flex gap-6 text-sm text-[#64748B]">
            <Link to="/annonces" className="hover:text-white transition-colors">Annonces</Link>
            <Link to="/login" className="hover:text-white transition-colors">Connexion</Link>
            <Link to="/register" className="hover:text-white transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}