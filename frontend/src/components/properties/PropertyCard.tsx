import { Link } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Star } from 'lucide-react';
import { Property } from '../../services/propertyApi';

interface PropertyCardProps {
    property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
    const imageUrl = primaryImage?.url || '/images/placeholder-property.jpg';

    return (
        <Link
            to={`/homestays/${property.slug}`}
            className="group flex flex-col h-full bg-[#1e2139] rounded-2xl overflow-hidden border border-[#5ce1e6]/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#5ce1e6]/50"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-property.jpg';
                    }}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-[#1e2139]/95 backdrop-blur-md text-xs font-semibold text-white tracking-wide uppercase rounded-lg shadow-sm border border-[#5ce1e6]/30">
                        {property.propertyType}
                    </span>
                    {property.availability.instantBook && (
                        <span className="px-3 py-1 bg-[#0a0e27]/95 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm tracking-wide uppercase flex items-center gap-1 border border-[#5ce1e6]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5CE1E6]" />
                            Instant
                        </span>
                    )}
                </div>

                {/* Rating Badge (Floating) */}
                {property.reviews.averageRating > 0 && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[#1e2139]/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-[#5ce1e6]/30">
                        <Star className="w-3.5 h-3.5 text-[#5CE1E6] fill-[#5CE1E6]" />
                        <span className="text-sm font-bold text-white">{property.reviews.averageRating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col flex-1 p-5">
                {/* Location */}
                <div className="flex items-center text-[#B0B7C3] text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5 mr-1 stroke-[2.5] text-[#5CE1E6]" />
                    <span className="truncate font-medium">{property.address.city}, {property.address.state}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-1 group-hover:text-[#5CE1E6] transition-colors">
                    {property.title}
                </h3>

                {/* Capacity Specs */}
                <div className="flex items-center gap-4 pb-4 mb-4 border-b border-[#5ce1e6]/20 text-sm text-[#B0B7C3]">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#5CE1E6] stroke-[2]" />
                        <span className="font-medium">{property.capacity.guests} Guest{property.capacity.guests !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-[#5CE1E6] stroke-[2]" />
                        <span className="font-medium">{property.capacity.bedrooms} Bed{property.capacity.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-[#5CE1E6] stroke-[2]" />
                        <span className="font-medium">{property.capacity.bathrooms} Bath{property.capacity.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-auto flex items-end justify-between">
                    <div>
                        <p className="text-[10px] uppercase text-[#B0B7C3] font-bold tracking-wider mb-0.5">Price per night</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">
                                ₹{property.pricing.basePrice.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-[#0a0e27] text-white text-sm font-semibold rounded-lg border border-[#5ce1e6]/20 group-hover:bg-[#5ce1e6]/10 group-hover:border-[#5ce1e6] transition-all">
                        View Details
                    </div>
                </div>
            </div>
        </Link>
    );
}
