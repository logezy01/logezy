import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import ListingCard from '../components/common/ListingCard';
import api from '../lib/axios';

const CITIES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Ouidah', 'Lokossa'];

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    bedrooms: '',
    min_price: '',
    max_price: '',
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/listings?${params.toString()}&limit=20`);
      setListings(res.data.listings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchListings();
  };

  const handleReset = () => {
    setFilters({ city: '', type: '', bedrooms: '', min_price: '', max_price: '' });
    setTimeout(() => fetchListings(), 100);
  };

  const update = (f, v) => setFilters(p => ({ ...p, [f]: v }));

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#0F172A]">
              Annonces immobilières
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              {loading ? 'Chargement...' : `${listings.length} annonce(s) trouvée(s)`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'border-[#1A6B3C] bg-[#E8F5EE] text-[#1A6B3C]'
                : 'border-[#E2E8F0] text-[#334155] hover:border-[#1A6B3C]'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-[#1A6B3C] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-4">
            <form onSubmit={handleSearch} className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1">Ville</label>
                  <select value={filters.city} onChange={(e) => update('city', e.target.value)} className="input-field">
                    <option value="">Toutes</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1">Type</label>
                  <select value={filters.type} onChange={(e) => update('type', e.target.value)} className="input-field">
                    <option value="">Tout</option>
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
                  <input type="number" placeholder="0" value={filters.min_price}
                    onChange={(e) => update('min_price', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1">Prix max (FCFA)</label>
                  <input type="number" placeholder="Max" value={filters.max_price}
                    onChange={(e) => update('max_price', e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button type="submit" className="btn-primary px-6 py-2 text-sm">
                  🔍 Rechercher
                </button>
                <button type="button" onClick={handleReset}
                  className="flex items-center gap-1 text-sm text-[#64748B] hover:text-red-500 transition-colors">
                  <X size={14} /> Réinitialiser
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-white" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-[#94A3B8]">
            <span className="text-6xl block mb-4">🏠</span>
            <p className="font-medium text-lg">Aucune annonce trouvée</p>
            <p className="text-sm mt-2">Essayez d'élargir vos critères de recherche</p>
            <button onClick={handleReset} className="btn-primary mt-6 px-6 py-2 text-sm inline-block">
              Voir toutes les annonces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}