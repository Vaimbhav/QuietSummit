import { Link } from 'react-router-dom';
import { Property } from '../../services/propertyApi';
import { useState, useEffect } from 'react';
import { addToWishlist, removeFromWishlist, isPropertyInWishlist } from '../../services/wishlistApi';
import { useAppSelector } from '../../store/hooks';

interface PropertyCardProps {
    property: Property;
    onWishlistChange?: () => void;
}

export default function PropertyCard({ property, onWishlistChange }: PropertyCardProps) {
    const { isAuthenticated } = useAppSelector((state) => state.user);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistId, setWishlistId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Check wishlist status on mount
    useEffect(() => {
        if (isAuthenticated) {
            checkWishlistStatus();
        }
    }, [isAuthenticated]);

    const checkWishlistStatus = async () => {
        try {
            const response = await isPropertyInWishlist(property._id);
            setIsInWishlist(response.inWishlist);
            if (response.wishlists && response.wishlists.length > 0) {
                setWishlistId(response.wishlists[0]);
            }
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // Redirect to login or show modal
            window.location.href = '/signup';
            return;
        }

        setLoading(true);
        try {
            if (isInWishlist && wishlistId) {
                await removeFromWishlist(wishlistId, property._id);
                setIsInWishlist(false);
            } else {
                // Add to default wishlist or first wishlist
                const response = await addToWishlist('default', property._id);
                setIsInWishlist(true);
                setWishlistId(response.wishlist._id);
            }
            onWishlistChange?.();
        } catch (error: any) {
            console.error('Wishlist error:', error);
            // If no default wishlist, might need to create one first
        } finally {
            setLoading(false);
        }
    };

    const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
    const imageUrl = primaryImage?.url || '/images/placeholder-property.jpg';

    return (
        <Link
            to={`/homestays/${property.slug}`}
            className="group block bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden border border-neutral-100 hover:border-neutral-200 h-full flex flex-col hover:-translate-y-2 transform"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-property.jpg';
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    disabled={loading}
                    className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all group/btn"
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <svg
                        className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-white group-hover/btn:text-red-50'}`}
                        fill={isInWishlist ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </button>

                {/* Property Type Badge */}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-xs font-semibold text-white tracking-wide uppercase rounded-lg border border-white/20 shadow-sm">
                        {property.propertyType}
                    </span>
                </div>

                {/* Instant Book Badge - Moved to bottom overlay */}
                {property.availability.instantBook && (
                    <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-primary-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg tracking-wider uppercase">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Instant
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1 relative">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-primary-700 transition-colors truncate">
                                {property.title}
                            </h3>
                        </div>
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 truncate">
                            <span className="truncate">{property.address.city}, {property.address.state}</span>
                        </p>
                    </div>
                </div>

                {/* Divider with capacity info */}
                <div className="py-4 border-b border-gray-100 flex items-center gap-5 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {property.capacity.guests}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {property.capacity.bedrooms}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {property.capacity.bathrooms}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-5">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-gray-900">
                                ₹{property.pricing.basePrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">/ night</span>
                        </div>

                    </div>

                    {property.reviews.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-gray-900 font-bold text-sm">
                            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {property.reviews.averageRating.toFixed(1)}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
