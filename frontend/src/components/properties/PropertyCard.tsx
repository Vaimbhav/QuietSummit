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
            className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-neutral-100"
        >
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-property.jpg';
                    }}
                />

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    disabled={loading}
                    className="absolute top-4 right-4 p-2.5 bg-white/95 hover:bg-white rounded-full shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <svg
                        className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                        fill={isInWishlist ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </button>

                {/* Property Type Badge */}
                <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-800 rounded-full capitalize">
                        {property.propertyType}
                    </span>
                </div>

                {/* Instant Book Badge */}
                {property.availability.instantBook && (
                    <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Instant Book
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-primary-800 transition-colors mb-1">
                            {property.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500">
                            {property.address.city}, {property.address.state}
                        </p>
                    </div>
                    {property.reviews.averageRating > 0 && (
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                            <span className="text-xs font-black text-gray-900">★</span>
                            <span className="text-sm font-bold text-gray-900">
                                {property.reviews.averageRating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 font-medium">
                    <span>{property.capacity.guests} guests</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{property.capacity.bedrooms} beds</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{property.capacity.bathrooms} baths</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-primary-900">
                            ₹{property.pricing.basePrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">/ night</span>
                    </div>
                    <span className="text-sm font-semibold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}
