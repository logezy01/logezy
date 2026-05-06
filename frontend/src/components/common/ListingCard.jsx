import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';

export default function ListingCard({ listing }) {
  const coverImage = listing.listing_images?.find(img => img.is_cover)?.image_url;

  const formatPrice = (price, period) => {
    const formatted = new Intl.NumberFormat('fr-FR').format(price);
    return period ? `${formatted} FCFA/${period}` : `${formatted} FCFA`;
  };

  return (
    <Link to={`/annonces/${listing.id}`} className="card overflow-hidden hover:shadow-float transition-shadow duration-200 group block">
      
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#E8F5EE] to-[#DBEAFE] overflow-hidden">
        {coverImage ? (
          <img
            src={`http://localhost:5000${coverImage}`}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🏠</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3">
          <span className={listing.type === 'location' ? 'badge-location' : 'badge-vente'}>
            {listing.type === 'location' ? 'Location' : 'Vente'}
          </span>
        </div>

        {listing.users?.is_verified && (
          <div className="absolute top-3 right-3 bg-white text-[#1A6B3C] text-xs font-bold px-2 py-1 rounded-full">
            ✓ Vérifié
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-bold text-sm text-[#0F172A] mb-1 line-clamp-2 leading-snug">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-[#64748B] text-xs mb-3">
          <MapPin size={12} />
          <span>{listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {listing.bedrooms > 0 && (
            <span className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2 py-1 text-xs text-[#334155]">
              <Bed size={10} /> {listing.bedrooms} ch.
            </span>
          )}
          {listing.bathrooms > 0 && (
            <span className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2 py-1 text-xs text-[#334155]">
              <Bath size={10} /> {listing.bathrooms} sdb.
            </span>
          )}
          {listing.area && (
            <span className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2 py-1 text-xs text-[#334155]">
              <Maximize size={10} /> {listing.area}m²
            </span>
          )}
        </div>

        {/* Prix */}
        <div className="font-black text-base text-[#1A6B3C]">
          {formatPrice(listing.price, listing.price_period)}
        </div>
      </div>
    </Link>
  );
}