import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowRight, Users } from 'lucide-react';

interface Guide {
    _id: string;
    name: string;
    videoIntroUrl?: string;
    profileImage?: string;
    specializations: string[];
    regions: string[];
    rating: number;
    reviewCount: number;
    verified: boolean;
}

interface Property {
    _id: string;
    title: string;
    slug: string;
    images: string[];
    address: {
        city: string;
        state: string;
    };
    pricing: {
        basePrice: number;
    };
    reviews: {
        averageRating: number;
        totalReviews: number;
    };
    capacity: {
        guests: number;
    };
}

interface CrossSellSectionProps {
    type: 'guides' | 'properties';
    location?: string;
    pincode?: string;
    title?: string;
    subtitle?: string;
}

export default function CrossSellSection({ type, location, pincode, title, subtitle }: CrossSellSectionProps) {
    const [items, setItems] = useState<Guide[] | Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCrossSellItems();
    }, [type, location, pincode]);

    const fetchCrossSellItems = async () => {
        setLoading(true);
        try {
            // Mock data for now - Replace with actual API calls
            if (type === 'guides') {
                // Mock guides data
                setItems([
                    {
                        _id: '1',
                        name: 'Rajesh Thakur',
                        specializations: ['Himalayan Treks', 'Cultural Tours'],
                        regions: [location || 'Himachal Pradesh'],
                        rating: 4.8,
                        reviewCount: 24,
                        verified: true,
                    },
                    {
                        _id: '2',
                        name: 'Priya Sharma',
                        specializations: ['Wildlife Photography', 'Mountain Expeditions'],
                        regions: [location || 'Uttarakhand'],
                        rating: 4.9,
                        reviewCount: 31,
                        verified: true,
                    },
                ] as Guide[]);
            } else {
                // Mock properties data
                setItems([
                    {
                        _id: '1',
                        title: 'Mountain View Cottage',
                        slug: 'mountain-view-cottage',
                        images: ['/images/homestay-placeholder.jpg'],
                        address: { city: location || 'Manali', state: 'Himachal Pradesh' },
                        pricing: { basePrice: 2500 },
                        reviews: { averageRating: 4.7, totalReviews: 18 },
                        capacity: { guests: 4 },
                    },
                    {
                        _id: '2',
                        title: 'Riverside Homestay',
                        slug: 'riverside-homestay',
                        images: ['/images/homestay-placeholder.jpg'],
                        address: { city: location || 'Manali', state: 'Himachal Pradesh' },
                        pricing: { basePrice: 3200 },
                        reviews: { averageRating: 4.9, totalReviews: 27 },
                        capacity: { guests: 6 },
                    },
                ] as Property[]);
            }
        } catch (error) {
            console.error('Error fetching cross-sell items:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-10 bg-dark">
                <div className="container mx-auto px-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-dark-border rounded w-48"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-48 bg-dark-card rounded-xl"></div>
                            <div className="h-48 bg-dark-card rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (items.length === 0) return null;

    return (
        <section className="py-16 bg-gradient-to-br from-parchment via-white to-parchment">
            <div className="container mx-auto px-6">
                <div className="mb-12 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-pine mb-4 font-serif"
                    >
                        {title || (type === 'guides' ? 'Meet Local Guides in This Area' : 'Suggested Stays Nearby')}
                    </motion.h2>
                    <p className="text-slate text-lg max-w-2xl mx-auto">
                        {subtitle || (type === 'guides'
                            ? 'Connect with experienced guides who know this region intimately'
                            : 'Enhance your journey with a comfortable stay in the area')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {type === 'guides' ? (
                        (items as Guide[]).map((guide, index) => (
                            <motion.div
                                key={guide._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-dark-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-dark-border group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pine to-slate flex items-center justify-center text-white text-2xl font-bold">
                                                {guide.profileImage ? (
                                                    <img src={guide.profileImage} alt={guide.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    guide.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            {guide.verified && (
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-pine rounded-full flex items-center justify-center border-2 border-white">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-pine mb-1">{guide.name}</h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold text-gray-900">{guide.rating}</span>
                                                    <span className="text-gray-500 text-sm">({guide.reviewCount})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {guide.specializations.slice(0, 3).map((spec) => (
                                                <span key={spec} className="px-3 py-1 bg-pine/10 text-pine text-xs font-semibold rounded-full">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <Link
                                        to={`/guides`}
                                        className="inline-flex items-center gap-2 text-pine font-semibold hover:gap-3 transition-all group-hover:text-slate"
                                    >
                                        View Profile <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        (items as Property[]).map((property, index) => (
                            <motion.div
                                key={property._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-dark-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-dark-border group"
                            >
                                <Link to={`/homestays/${property.slug}`}>
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={property.images[0]}
                                            alt={property.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-dark-light border border-dark-border backdrop-blur-sm rounded-full shadow-lg">
                                            <span className="font-bold text-pine">₹{property.pricing.basePrice.toLocaleString()}</span>
                                            <span className="text-xs text-gray-600">/night</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-pine mb-2 line-clamp-1">{property.title}</h3>
                                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{property.address.city}, {property.address.state}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">{property.reviews.averageRating.toFixed(1)}</span>
                                                <span className="text-gray-500 text-sm">({property.reviews.totalReviews})</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Users className="w-4 h-4" />
                                                <span className="text-sm">{property.capacity.guests} guests</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        to={type === 'guides' ? '/guides' : '/homestays'}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-pine text-white font-semibold rounded-xl hover:bg-slate transition-colors shadow-lg hover:shadow-xl"
                    >
                        View All {type === 'guides' ? 'Guides' : 'Stays'}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
