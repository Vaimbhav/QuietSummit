import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Share2, Users, Home as HomeIcon, Bed, Bath, MessageCircle, Check } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getPropertyBySlug, Property } from '../services/propertyApi';
import { calculateBookingPrice } from '../services/bookingApi';
import PropertyReviews from '../components/reviews/PropertyReviews';
import Loader from '../components/common/Loader';
import BookingModal from '../components/booking/BookingModal';
import BookingGuard from '../components/common/BookingGuard';
import PropertyGallery from '../components/properties/PropertyGallery';
import TrustBadges from '../components/properties/TrustBadges';
import AmenityGrid from '../components/properties/AmenityGrid';

export default function PropertyDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [showShareToast, setShowShareToast] = useState(false);
    const [guests, setGuests] = useState(1);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [priceBreakdown, setPriceBreakdown] = useState<{
        basePrice: number;
        cleaningFee: number;
        totalPrice: number;
        nights: number;
    } | null>(null);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShowShareToast(true);
            setTimeout(() => setShowShareToast(false), 3000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    useEffect(() => {
        if (slug) {
            loadProperty();
        }
    }, [slug]);

    useEffect(() => {
        if (checkIn && checkOut && property) {
            calculatePrice();
        }
    }, [checkIn, checkOut, property]);

    const loadProperty = async () => {
        try {
            setLoading(true);
            const data = await getPropertyBySlug(slug!);
            setProperty(data);
        } catch (err) {
            setError('Failed to load property');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = async () => {
        if (!property || !checkIn || !checkOut) return;

        try {
            const data = await calculateBookingPrice({
                propertyId: property._id,
                checkIn: checkIn.toISOString().split('T')[0],
                checkOut: checkOut.toISOString().split('T')[0],
                guests,
            });
            setPriceBreakdown(data);
        } catch (error) {
            console.error('Error calculating price:', error);
        }
    };

    const validateBookingForm = () => {
        if (!checkIn || !checkOut) {
            return 'Please select check-in and check-out dates';
        }

        const checkInDate = checkIn;
        const checkOutDate = checkOut;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            return 'Check-in date must be in the future';
        }

        if (checkOutDate <= checkInDate) {
            return 'Check-out date must be after check-in date';
        }

        if (guests < 1) {
            return 'Please select at least 1 guest';
        }

        if (property && guests > property.capacity.guests) {
            return `This property can accommodate maximum ${property.capacity.guests} guests`;
        }

        return null;
    };

    const handleBookingClick = (triggerAuthCheck: () => void) => {
        const validationError = validateBookingForm();
        if (validationError) {
            setBookingError(validationError);
            return;
        }

        setBookingError(null);
        triggerAuthCheck();
    };

    if (loading) {
        return <Loader />;
    }

    if (error || !property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
                <Link to="/properties" className="text-primary-600 hover:text-primary-700 font-medium">
                    ← Back to Properties
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b border-gray-100">
                <div className="container mx-auto px-4 py-6">
                    <nav className="mb-4">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li><Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
                            <li className="text-gray-400">/</li>
                            <li><Link to="/properties" className="text-gray-600 hover:text-gray-900">Properties</Link></li>
                            <li className="text-gray-400">/</li>
                            <li className="text-gray-900 font-medium">{property.title}</li>
                        </ol>
                    </nav>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{property.reviews.averageRating.toFixed(1)}</span>
                                    <span className="text-gray-600">({property.reviews.totalReviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{property.address.city}, {property.address.state}</span>
                                </div>

                            </div>
                        </div>
                        <div className="flex items-center gap-3 relative">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                            >
                                {showShareToast ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                                <span className={showShareToast ? "text-green-600 font-medium" : "hidden md:inline font-medium"}>
                                    {showShareToast ? 'Copied!' : 'Share'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <PropertyGallery images={property.images} title={property.title} />
            </div>
            <div className="container mx-auto px-4 pb-12">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{property.capacity.guests}</p>
                                    <p className="text-sm text-gray-600">Guests</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <HomeIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{property.capacity.bedrooms}</p>
                                    <p className="text-sm text-gray-600">Bedrooms</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Bed className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{property.capacity.beds}</p>
                                    <p className="text-sm text-gray-600">Beds</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Bath className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{property.capacity.bathrooms}</p>
                                    <p className="text-sm text-gray-600">Baths</p>
                                </div>
                            </div>
                        </div>
                        <TrustBadges />
                        <div className="border-t border-gray-100 pt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this place</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
                        </div>
                        <div className="border-t border-gray-100 pt-8">
                            <AmenityGrid amenities={property.amenities} />
                        </div>
                        <div className="border-t border-gray-100 pt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet your host</h2>
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-100">
                                <div className="flex items-start gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {property.host.profileImage ? (
                                                <img src={property.host.profileImage} alt={property.host.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                property.host.name.charAt(0).toUpperCase()
                                            )}
                                        </div>

                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.host.name}</h3>
                                        <p className="text-gray-600 mb-4">Member since {new Date(property.createdAt).getFullYear()}</p>
                                        {property.host.hostProfile && (
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Response rate</p>
                                                    <p className="text-lg font-bold text-gray-900">{property.host.hostProfile.responseRate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Response time</p>
                                                    <p className="text-lg font-bold text-gray-900">{property.host.hostProfile.responseTime}</p>
                                                </div>
                                            </div>
                                        )}
                                        <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
                                            <MessageCircle className="w-5 h-5" />
                                            Contact Host
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 p-8 hover:shadow-3xl transition-all duration-300">
                                    <div className="mb-6">
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">₹{property.pricing.basePrice}</span>
                                            <span className="text-gray-600 mb-1 font-medium">/ night</span>
                                        </div>
                                        {(property.pricing.cleaningFee || 0) > 0 && (
                                            <p className="text-sm text-gray-600">+ ₹{property.pricing.cleaningFee} cleaning fee</p>
                                        )}
                                    </div>
                                    <div className="space-y-4 mb-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                                                <div className="relative">
                                                    <DatePicker
                                                        selected={checkIn}
                                                        onChange={(date: Date | null) => {
                                                            setCheckIn(date);
                                                            if (checkOut && date && date >= checkOut) {
                                                                setCheckOut(null);
                                                            }
                                                        }}
                                                        selectsStart
                                                        startDate={checkIn}
                                                        endDate={checkOut}
                                                        minDate={getMinDate()}
                                                        placeholderText="Add date"
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-300 bg-white font-medium text-gray-900"
                                                        dateFormat="dd/MM/yyyy"
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                                                <div className="relative">
                                                    <DatePicker
                                                        selected={checkOut}
                                                        onChange={(date: Date | null) => setCheckOut(date)}
                                                        selectsEnd
                                                        startDate={checkIn}
                                                        endDate={checkOut}
                                                        minDate={checkIn || getMinDate()}
                                                        placeholderText="Add date"
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-300 bg-white font-medium text-gray-900"
                                                        dateFormat="dd/MM/yyyy"
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                <select
                                                    value={guests}
                                                    onChange={(e) => setGuests(parseInt(e.target.value))}
                                                    className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none bg-white cursor-pointer hover:border-gray-300 font-medium text-gray-900"
                                                >
                                                    {Array.from({ length: property.capacity.guests }, (_, i) => i + 1).map((num) => (
                                                        <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {bookingError && (
                                        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-shake">
                                            <p className="text-sm text-red-800 font-medium">{bookingError}</p>
                                        </div>
                                    )}
                                    {priceBreakdown && (
                                        <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100/50">
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between text-gray-700">
                                                    <span className="font-medium">₹{property.pricing.basePrice} × {priceBreakdown.nights} nights</span>
                                                    <span className="font-semibold">₹{priceBreakdown.basePrice}</span>
                                                </div>
                                                {priceBreakdown.cleaningFee > 0 && (
                                                    <div className="flex justify-between text-gray-700">
                                                        <span className="font-medium">Cleaning fee</span>
                                                        <span className="font-semibold">₹{priceBreakdown.cleaningFee}</span>
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t-2 border-blue-200 flex justify-between font-bold text-lg text-gray-900">
                                                    <span>Total</span>
                                                    <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">₹{priceBreakdown.totalPrice}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <BookingGuard onAuthenticated={() => setIsBookingModalOpen(true)}>
                                        {(triggerAuthCheck) => (
                                            <button
                                                onClick={() => handleBookingClick(triggerAuthCheck)}
                                                disabled={!checkIn || !checkOut}
                                                className="w-full py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg active:scale-[0.98]"
                                            >
                                                Continue to Book
                                            </button>
                                        )}
                                    </BookingGuard>
                                    <p className="text-center text-sm text-gray-500 mt-4">You won't be charged yet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-100 pt-12">
                    <PropertyReviews propertyId={property._id} averageRating={property.reviews.averageRating} totalReviews={property.reviews.totalReviews} />
                </div>
            </div>
            {isBookingModalOpen && priceBreakdown && checkIn && checkOut && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    property={property}
                    checkIn={checkIn.toISOString().split('T')[0]}
                    checkOut={checkOut.toISOString().split('T')[0]}
                    guests={guests}
                    priceBreakdown={priceBreakdown}
                />
            )}
        </div>
    );
}
