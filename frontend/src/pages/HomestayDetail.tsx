import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Share2, Users, Home as HomeIcon, Bed, Bath, MessageCircle, Check, X, ChevronLeft, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getPropertyBySlug, Property } from '../services/propertyApi';
import { calculateBookingPrice } from '../services/bookingApi';
import PropertyReviews from '../components/reviews/PropertyReviews';
import Loader from '../components/common/Loader';
import BookingModal from '../components/booking/BookingModal';
import BookingGuard from '../components/common/BookingGuard';
import PropertyGallery from '../components/properties/PropertyGallery';
import SEOHead from '../components/common/SEOHead';

interface AccordionItemProps {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    isOpen: boolean
    onToggle: () => void
    iconContainerClass?: string
}

const PremiumAccordionItem = ({ title, icon, children, isOpen, onToggle, iconContainerClass = "gradient-premium text-white" }: AccordionItemProps) => {
    return (
        <div className="rounded-2xl overflow-hidden bg-[#1e2139] border border-[#5ce1e6]/20 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 sm:p-5 bg-[#0a0e27]/40"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${iconContainerClass} bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] shadow-[0_4px_12px_rgba(61,157,163,0.3)]`}>
                        {icon}
                    </div>
                    <span className="font-bold text-lg text-white">{title}</span>
                </div>
                <div className={`p-1 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} bg-white/10`}>
                    <ChevronDown className="w-5 h-5 text-[#B0B7C3]" />
                </div>
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
            >
                <div className="p-5 pt-2 border-t border-[#5ce1e6]/10 bg-[#0a0e27]/20">
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

export default function PropertyDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [showShareToast, setShowShareToast] = useState(false);
    const [guests, setGuests] = useState(1);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [isMobileDateOpen, setIsMobileDateOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('about');
    const [priceBreakdown, setPriceBreakdown] = useState<{
        basePrice: number;
        cleaningFee: number;
        totalPrice: number;
        nights: number;
    } | null>(null);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isMobileDateOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileDateOpen]);

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
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[#0a0e27]">
                <div className="text-6xl mb-6">😔</div>
                <h2 className="text-3xl font-bold text-white mb-4">Property Not Found</h2>
                <p className="mb-8 text-[#B0B7C3]">{error || 'The property you are looking for does not exist.'}</p>
                <button
                    onClick={(e) => { e.stopPropagation(); navigate('/properties') }}
                    className="px-8 py-3 bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 inline" />
                    Back to Properties
                </button>
            </div>
        );
    }

    // SEO Schema Data
    const schemaData = {
        name: property.title,
        description: property.description,
        image: property.images.map(img => img.url),
        address: {
            streetAddress: property.address.street || '',
            addressLocality: property.address.city,
            addressRegion: property.address.state,
            postalCode: property.address.postalCode,
            addressCountry: 'India',
        },
        aggregateRating: property.reviews.totalReviews > 0 ? {
            ratingValue: property.reviews.averageRating,
            reviewCount: property.reviews.totalReviews,
        } : undefined,
        priceRange: `₹${property.pricing.basePrice}`,
        checkinTime: property.houseRules?.checkIn || '14:00',
        checkoutTime: property.houseRules?.checkOut || '11:00',
        amenities: property.amenities || [],
        url: window.location.href,
    };

    return (
        <div className="min-h-screen pb-20 md:pb-0 bg-[#0a0e27]">
            <SEOHead
                title={property.title}
                description={property.description}
                keywords={`${property.title}, ${property.address.city}, ${property.address.state}, homestay, accommodation, mountain stay`}
                ogImage={property.images[0]?.url}
                schema={schemaData}
                schemaType="LodgingBusiness"
            />

            {/* Hero Section with Navigation */}
            <section className="relative bg-linear-to-br from-gray-900 via-slate-900 to-gray-800 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-size-[40px_40px]"></div>
                    </div>
                </div>

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 max-w-full">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            navigate('/properties')
                        }}
                        className="flex items-center gap-2 text-white hover:text-white mb-4 sm:mb-6 transition-all font-medium text-sm sm:text-base px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        Back to Properties
                    </button>

                    {/* Rating Badge Positioned Above Gallery */}
                    <div className="relative mb-4 max-w-full overflow-hidden">
                        <div className="absolute top-4 right-4 z-10 bg-[#0a0e27]/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border border-[#5ce1e6]/30">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#5CE1E6] text-[#5CE1E6]" />
                                <span className="font-bold text-sm sm:text-base text-white">{property.reviews.averageRating.toFixed(1)}</span>
                                <span className="text-xs text-[#B0B7C3]">({property.reviews.totalReviews})</span>
                            </div>
                        </div>
                        <div className="absolute top-4 left-4 z-10 bg-linear-to-br from-primary-300/20 to-accent-500/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border border-primary-300/30">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-1.5 transition-colors group"
                            >
                                {showShareToast ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
                                <span className={showShareToast ? "text-green-400 font-semibold text-xs sm:text-sm" : "font-semibold text-white text-xs sm:text-sm"}>
                                    {showShareToast ? 'Copied!' : 'Share'}
                                </span>
                            </button>
                        </div>
                        <PropertyGallery images={property.images} title={property.title} />
                    </div>
                </div>

                {/* Bottom decorative wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-12 sm:h-16 fill-white opacity-90">
                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                    </svg>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-6 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-full relative">
                    {/* Left Column - Main Content */}
                    <div className="md:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 text-[#5CE1E6]">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-base sm:text-lg font-semibold tracking-wide">
                                    {property.address.city}, {property.address.state}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                                {property.title}
                            </h1>
                        </motion.div>

                        {/* Quick Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
                        >
                            <div className="rounded-2xl p-4 sm:p-5 transition-all duration-300 group bg-[#1e2139] border border-[#5ce1e6]/20 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white p-2 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] shadow-[0_4px_12px_rgba(61,157,163,0.3)]" />
                                <div className="text-xl sm:text-2xl font-black text-white">
                                    {property.capacity.guests}
                                </div>
                                <div className="text-xs sm:text-sm font-bold mt-1 sm:mt-2 uppercase tracking-wide text-[#B0B7C3]">
                                    Guests
                                </div>
                            </div>
                            <div className="rounded-2xl p-4 sm:p-5 transition-all duration-300 group bg-[#1e2139] border border-[#5ce1e6]/20 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                                <HomeIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white p-2 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] shadow-[0_4px_12px_rgba(61,157,163,0.3)]" />
                                <div className="text-xl sm:text-2xl font-black text-white">
                                    {property.capacity.bedrooms}
                                </div>
                                <div className="text-xs sm:text-sm font-bold mt-1 sm:mt-2 uppercase tracking-wide text-[#B0B7C3]">
                                    Bedrooms
                                </div>
                            </div>
                            <div className="rounded-2xl p-4 sm:p-5 transition-all duration-300 group bg-[#1e2139] border border-[#5ce1e6]/20 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                                <Bed className="w-7 h-7 sm:w-8 sm:h-8 text-white p-2 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] shadow-[0_4px_12px_rgba(61,157,163,0.3)]" />
                                <div className="text-xl sm:text-2xl font-black text-white">
                                    {property.capacity.beds}
                                </div>
                                <div className="text-xs sm:text-sm font-bold mt-1 sm:mt-2 uppercase tracking-wide text-[#B0B7C3]">
                                    Beds
                                </div>
                            </div>
                            <div className="rounded-2xl p-4 sm:p-5 transition-all duration-300 group bg-[#1e2139] border border-[#5ce1e6]/20 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                                <Bath className="w-7 h-7 sm:w-8 sm:h-8 text-white p-2 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] shadow-[0_4px_12px_rgba(61,157,163,0.3)]" />
                                <div className="text-xl sm:text-2xl font-black text-white">
                                    {property.capacity.bathrooms}
                                </div>
                                <div className="text-xs sm:text-sm font-bold mt-1 sm:mt-2 uppercase tracking-wide text-[#B0B7C3]">
                                    Bathrooms
                                </div>
                            </div>
                        </motion.div>

                        {/* About this place - Premium Accordion */}
                        <PremiumAccordionItem
                            title="About this place"
                            icon={<HomeIcon className="w-5 h-5" />}
                            isOpen={expandedSection === 'about'}
                            onToggle={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                        >
                            <p className="text-[#B0B7C3] text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                {property.description}
                            </p>
                        </PremiumAccordionItem>

                        {/* Amenities - Premium Accordion */}
                        <PremiumAccordionItem
                            title="What this place offers"
                            icon={<Check className="w-5 h-5" />}
                            isOpen={expandedSection === 'amenities'}
                            onToggle={() => setExpandedSection(expandedSection === 'amenities' ? null : 'amenities')}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {property.amenities.map((amenity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 sm:p-4 bg-[#0a0e27] rounded-xl border border-[#5ce1e6]/10 hover:border-[#5ce1e6]/30 transition-all group"
                                    >
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <span className="font-medium text-white text-sm sm:text-base">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </PremiumAccordionItem>

                        {/* Meet your host - Premium Accordion */}
                        <PremiumAccordionItem
                            title="Meet your host"
                            icon={<Users className="w-5 h-5" />}
                            isOpen={expandedSection === 'host'}
                            onToggle={() => setExpandedSection(expandedSection === 'host' ? null : 'host')}
                        >
                            <div className="bg-linear-to-br from-[#1e2139] to-[#0a0e27] rounded-2xl p-6 sm:p-8 border border-[#5ce1e6]/10">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                    <div className="relative shrink-0">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-[#1e2139]">
                                            {property.host.profileImage ? (
                                                <img src={property.host.profileImage} alt={property.host.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                property.host.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center sm:text-left w-full">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{property.host.name}</h3>
                                        <p className="text-[#B0B7C3] mb-4 text-sm sm:text-base">Host since {new Date(property.createdAt).getFullYear()}</p>
                                        {property.host.hostProfile && (
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                                                <div className="bg-[#0a0e27] rounded-xl p-3 sm:p-4 shadow-sm border border-[#5ce1e6]/10">
                                                    <p className="text-xs sm:text-sm text-[#B0B7C3] mb-1">Response rate</p>
                                                    <p className="text-lg sm:text-xl font-bold text-white">{property.host.hostProfile.responseRate}%</p>
                                                </div>
                                                <div className="bg-[#0a0e27] rounded-xl p-3 sm:p-4 shadow-sm border border-[#5ce1e6]/10">
                                                    <p className="text-xs sm:text-sm text-[#B0B7C3] mb-1">Response time</p>
                                                    <p className="text-sm sm:text-base font-bold text-white">{property.host.hostProfile.responseTime}</p>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => window.location.href = `mailto:${property.host.email}`}
                                            className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-[#3d9da3] to-[#2d6b9e] hover:from-[#4ab3b9] hover:to-[#3788b3] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            Contact Host
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </PremiumAccordionItem>
                    </div>

                    {/* Right Column - Booking Card (Desktop) */}
                    <div className="hidden md:col-span-1 md:block">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="sticky top-28 bg-[#1e2139] rounded-2xl p-9 border border-[#5ce1e6]/20 shadow-[0_12px_28px_rgba(0,0,0,0.35)] z-10"
                        >
                            <div className="mb-8">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs text-[#B0B7C3] font-medium">Starting from</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">₹{property.pricing.basePrice.toLocaleString()}</span>
                                    <span className="text-sm text-[#B0B7C3] font-medium">/ night</span>
                                </div>
                                {(property.pricing.cleaningFee || 0) > 0 && (
                                    <p className="text-xs text-[#B0B7C3] mt-1.5 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-[#5CE1E6] rounded-full"></span>
                                        + ₹{property.pricing.cleaningFee} cleaning fee
                                    </p>
                                )}
                            </div>

                            <div className="space-y-7 mb-8">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-[#B0B7C3] uppercase tracking-wide">Check-in</label>
                                        <div className="relative">
                                            <DatePicker
                                                calendarClassName="premium-calendar"
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
                                                placeholderText="Select date"
                                                className="w-full px-3 py-3.5 border border-[#5ce1e6]/20 rounded-lg focus:ring-2 focus:ring-[#5ce1e6]/20 focus:border-[#5ce1e6] transition-all font-medium text-white placeholder:text-[#B0B7C3] bg-[#0a0e27] text-sm"
                                                dateFormat="dd MMM yyyy"
                                                renderCustomHeader={({
                                                    date,
                                                    changeYear,
                                                    decreaseMonth,
                                                    increaseMonth,
                                                    prevMonthButtonDisabled,
                                                    nextMonthButtonDisabled,
                                                }) => (
                                                    <div className="flex items-center justify-between px-2 py-2 bg-[#0a0e27] border-b border-[#5ce1e6]/10">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={decreaseMonth}
                                                                disabled={prevMonthButtonDisabled}
                                                                type="button"
                                                                className={`p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors ${prevMonthButtonDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                aria-label="Previous month"
                                                            >
                                                                <ChevronLeft className="w-4 h-4 text-[#B0B7C3]" />
                                                            </button>
                                                            <span className="text-sm font-bold text-white min-w-20 text-center">
                                                                {date.toLocaleString('default', { month: 'long' })}
                                                            </span>
                                                            <button
                                                                onClick={increaseMonth}
                                                                disabled={nextMonthButtonDisabled}
                                                                type="button"
                                                                className={`p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors ${nextMonthButtonDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                aria-label="Next month"
                                                            >
                                                                <ChevronRight className="w-4 h-4 text-[#B0B7C3]" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); changeYear(date.getFullYear() - 1); }}
                                                                type="button"
                                                                className="p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors text-[#B0B7C3]"
                                                                aria-label="Previous year"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                            <span className="text-sm font-bold text-white min-w-12 text-center">
                                                                {date.getFullYear()}
                                                            </span>
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); changeYear(date.getFullYear() + 1); }}
                                                                type="button"
                                                                className="p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors text-[#B0B7C3]"
                                                                aria-label="Next year"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-[#B0B7C3] uppercase tracking-wide">Check-out</label>
                                        <div className="relative">
                                            <DatePicker
                                                calendarClassName="premium-calendar"
                                                selected={checkOut}
                                                onChange={(date: Date | null) => setCheckOut(date)}
                                                selectsEnd
                                                startDate={checkIn}
                                                endDate={checkOut}
                                                minDate={checkIn || getMinDate()}
                                                placeholderText="Select date"
                                                className="w-full px-3 py-3.5 border border-[#5ce1e6]/20 rounded-lg focus:ring-2 focus:ring-[#5ce1e6]/20 focus:border-[#5ce1e6] transition-all font-medium text-white placeholder:text-[#B0B7C3] bg-[#0a0e27] text-sm"
                                                dateFormat="dd MMM yyyy"
                                                renderCustomHeader={({
                                                    date,
                                                    changeYear,
                                                    decreaseMonth,
                                                    increaseMonth,
                                                    prevMonthButtonDisabled,
                                                    nextMonthButtonDisabled,
                                                }) => (
                                                    <div className="flex items-center justify-between px-2 py-2 bg-[#0a0e27] border-b border-[#5ce1e6]/10">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={decreaseMonth}
                                                                disabled={prevMonthButtonDisabled}
                                                                type="button"
                                                                className={`p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors ${prevMonthButtonDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                aria-label="Previous month"
                                                            >
                                                                <ChevronLeft className="w-4 h-4 text-[#B0B7C3]" />
                                                            </button>
                                                            <span className="text-sm font-bold text-white min-w-20 text-center">
                                                                {date.toLocaleString('default', { month: 'long' })}
                                                            </span>
                                                            <button
                                                                onClick={increaseMonth}
                                                                disabled={nextMonthButtonDisabled}
                                                                type="button"
                                                                className={`p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors ${nextMonthButtonDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                aria-label="Next month"
                                                            >
                                                                <ChevronRight className="w-4 h-4 text-[#B0B7C3]" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); changeYear(date.getFullYear() - 1); }}
                                                                type="button"
                                                                className="p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors text-[#B0B7C3]"
                                                                aria-label="Previous year"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                            <span className="text-sm font-bold text-white min-w-12 text-center">
                                                                {date.getFullYear()}
                                                            </span>
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); changeYear(date.getFullYear() + 1); }}
                                                                type="button"
                                                                className="p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors text-[#B0B7C3]"
                                                                aria-label="Next year"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#B0B7C3] uppercase tracking-wide">Guests</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B7C3] pointer-events-none" />
                                        <select
                                            value={guests}
                                            onChange={(e) => setGuests(parseInt(e.target.value))}
                                            className="w-full pl-10 pr-10 py-3.5 border border-[#5ce1e6]/20 rounded-lg focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-[#5ce1e6] appearance-none bg-[#0a0e27] cursor-pointer transition-all font-semibold text-white text-sm shadow-sm hover:shadow-md hover:border-[#5ce1e6]/50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-position-[center_right_1rem] bg-no-repeat"
                                            aria-label="Select guests"
                                        >
                                            {Array.from({ length: property.capacity.guests }, (_, i) => i + 1).map((num) => (
                                                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {bookingError && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                                    <div className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-red-400" />
                                    <p className="text-xs text-red-300 font-medium">{bookingError}</p>
                                </div>
                            )}
                            <BookingGuard onAuthenticated={() => setIsBookingModalOpen(true)}>
                                {(triggerAuthCheck) => (
                                    <button
                                        onClick={() => handleBookingClick(triggerAuthCheck)}
                                        disabled={!checkIn || !checkOut}
                                        className="w-full py-5 font-bold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98] transition-all bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] text-white"
                                    >
                                        Reserve Now
                                    </button>
                                )}
                            </BookingGuard>

                            <p className="mt-4 text-center text-xs text-[#B0B7C3]">You won't be charged yet</p>
                        </motion.div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-10 border-t border-[#5ce1e6]/20 pt-10">
                    <div className="bg-[#1e2139] rounded-2xl p-6 sm:p-8 border border-[#5ce1e6]/20 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                        <PropertyReviews propertyId={property._id} averageRating={property.reviews.averageRating} totalReviews={property.reviews.totalReviews} />
                    </div>
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

            {/* Fixed Bottom Bar (Mobile Only) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden shadow-2xl p-3 bg-[#1e2139] border-t-2 border-[#5ce1e6]/30">
                <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-[#B0B7C3]">Price</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">₹{property.pricing.basePrice.toLocaleString()}</span>
                            <span className="text-xs text-[#B0B7C3]">/ night</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileDateOpen(true)}
                        className="px-6 py-2.5 rounded-xl text-base font-bold transition-all text-white shadow-lg bg-linear-to-br from-[#3d9da3] to-[#2d6b9e]"
                    >
                        {checkIn && checkOut ? 'Continue' : 'Check Availability'}
                    </button>
                </div>
            </div>

            {/* Mobile Date Selection Sheet */}
            <AnimatePresence>
                {isMobileDateOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileDateOpen(false)}
                            className="fixed inset-0 bg-black/50 z-60 md:hidden backdrop-blur-sm"
                            style={{ touchAction: 'none' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-70 md:hidden bg-[#1e2139] rounded-t-3xl shadow-2xl h-auto max-h-[90vh] overflow-hidden flex flex-col safe-area-pb"
                        >
                            {/* Premium Header */}
                            <div className="bg-linear-to-r from-[#3d9da3] to-[#2d6b9e] px-6 py-5 flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1.5">Select Dates</h3>
                                    <p className="text-sm text-white/90 font-medium">Choose your stay period</p>
                                </div>
                                <button
                                    onClick={() => setIsMobileDateOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto flex-1">
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex text-xs font-bold text-[#B0B7C3] uppercase tracking-wide mb-3 items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#5CE1E6]"></div>
                                                Check-in
                                            </label>
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
                                                    placeholderText="DD/MM/YYYY"
                                                    className="w-full px-5 py-4 border-2 border-[#5ce1e6]/20 rounded-2xl focus:ring-2 focus:ring-[#5ce1e6] focus:border-[#5ce1e6] bg-[#0a0e27] font-semibold text-white text-base hover:border-[#5ce1e6]/40 transition-colors"
                                                    dateFormat="dd/MM/yyyy"
                                                    calendarClassName="premium-calendar"
                                                    popperClassName="!z-100"
                                                    popperPlacement="bottom-start"
                                                    popperContainer={({ children }) => createPortal(children, document.body)}
                                                    renderCustomHeader={({
                                                        date,
                                                        changeYear,
                                                        decreaseMonth,
                                                        increaseMonth,
                                                        prevMonthButtonDisabled,
                                                        nextMonthButtonDisabled,
                                                    }) => (
                                                        <div className="flex items-center justify-between px-2 py-2 bg-[#0a0e27] border-b border-[#5ce1e6]/10">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={decreaseMonth}
                                                                    disabled={prevMonthButtonDisabled}
                                                                    type="button"
                                                                    className={`p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors ${prevMonthButtonDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                    aria-label="Previous month"
                                                                >
                                                                    <ChevronLeft className="w-4 h-4 text-[#B0B7C3]" />
                                                                </button>
                                                                <span className="text-sm font-bold text-white min-w-20 text-center">
                                                                    {date.toLocaleString('default', { month: 'long' })}
                                                                </span>
                                                                <button
                                                                    onClick={increaseMonth}
                                                                    disabled={nextMonthButtonDisabled}
                                                                    type="button"
                                                                    className={`p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors ${nextMonthButtonDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                    aria-label="Next month"
                                                                >
                                                                    <ChevronRight className="w-4 h-4 text-[#B0B7C3]" />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); changeYear(date.getFullYear() - 1); }}
                                                                    type="button"
                                                                    className="p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors text-[#B0B7C3]"
                                                                    aria-label="Previous year"
                                                                >
                                                                    <ChevronLeft className="w-4 h-4" />
                                                                </button>
                                                                <span className="text-sm font-bold text-white min-w-12 text-center">
                                                                    {date.getFullYear()}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); changeYear(date.getFullYear() + 1); }}
                                                                    type="button"
                                                                    className="p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors text-[#B0B7C3]"
                                                                    aria-label="Next year"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex text-xs font-bold text-[#B0B7C3] uppercase tracking-wide mb-3 items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#5CE1E6]"></div>
                                                Check-out
                                            </label>
                                            <div className="relative">
                                                <DatePicker
                                                    selected={checkOut}
                                                    onChange={(date: Date | null) => setCheckOut(date)}
                                                    selectsEnd
                                                    startDate={checkIn}
                                                    endDate={checkOut}
                                                    minDate={checkIn || getMinDate()}
                                                    placeholderText="DD/MM/YYYY"
                                                    className="w-full px-5 py-4 border-2 border-[#5ce1e6]/20 rounded-2xl focus:ring-2 focus:ring-[#5ce1e6] focus:border-[#5ce1e6] bg-[#0a0e27] font-semibold text-white text-base hover:border-[#5ce1e6]/40 transition-colors"
                                                    dateFormat="dd/MM/yyyy"
                                                    calendarClassName="premium-calendar"
                                                    popperClassName="!z-100"
                                                    popperPlacement="bottom-start"
                                                    popperContainer={({ children }) => createPortal(children, document.body)}
                                                    renderCustomHeader={({
                                                        date,
                                                        changeYear,
                                                        decreaseMonth,
                                                        increaseMonth,
                                                        prevMonthButtonDisabled,
                                                        nextMonthButtonDisabled,
                                                    }) => (
                                                        <div className="flex items-center justify-between px-2 py-2 bg-[#0a0e27] border-b border-[#5ce1e6]/10">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={decreaseMonth}
                                                                    disabled={prevMonthButtonDisabled}
                                                                    type="button"
                                                                    className={`p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors ${prevMonthButtonDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                    aria-label="Previous month"
                                                                >
                                                                    <ChevronLeft className="w-4 h-4 text-[#B0B7C3]" />
                                                                </button>
                                                                <span className="text-sm font-bold text-white min-w-20 text-center">
                                                                    {date.toLocaleString('default', { month: 'long' })}
                                                                </span>
                                                                <button
                                                                    onClick={increaseMonth}
                                                                    disabled={nextMonthButtonDisabled}
                                                                    type="button"
                                                                    className={`p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors ${nextMonthButtonDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                    aria-label="Next month"
                                                                >
                                                                    <ChevronRight className="w-4 h-4 text-[#B0B7C3]" />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); changeYear(date.getFullYear() - 1); }}
                                                                    type="button"
                                                                    className="p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors text-[#B0B7C3]"
                                                                    aria-label="Previous year"
                                                                >
                                                                    <ChevronLeft className="w-4 h-4" />
                                                                </button>
                                                                <span className="text-sm font-bold text-white min-w-12 text-center">
                                                                    {date.getFullYear()}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); changeYear(date.getFullYear() + 1); }}
                                                                    type="button"
                                                                    className="p-1.5 hover:bg-[#1e2139] rounded-lg transition-colors text-[#B0B7C3]"
                                                                    aria-label="Next year"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex text-xs font-bold text-[#B0B7C3] uppercase tracking-wide mb-3 items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#5CE1E6]"></div>
                                            Guests
                                        </label>
                                        <div className="relative">
                                            <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0B7C3] pointer-events-none" />
                                            <select
                                                value={guests}
                                                onChange={(e) => setGuests(parseInt(e.target.value))}
                                                className="w-full pl-14 pr-12 py-4 border-2 border-[#5ce1e6]/20 rounded-2xl focus:ring-2 focus:ring-[#5ce1e6] focus:border-[#5ce1e6] appearance-none bg-[#0a0e27] font-semibold text-white text-base hover:border-[#5ce1e6]/40 transition-colors cursor-pointer shadow-sm hover:shadow-md bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-position-[center_right_1.25rem] bg-no-repeat"
                                                aria-label="Select guests"
                                            >
                                                {Array.from({ length: property.capacity.guests }, (_, i) => i + 1).map((num) => (
                                                    <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {bookingError && (
                                        <div className="p-4 bg-red-500/20 border-2 border-red-500/50 rounded-2xl animate-shake">
                                            <p className="text-sm text-red-300 font-semibold">{bookingError}</p>
                                        </div>
                                    )}

                                    {priceBreakdown && (
                                        <div className="hidden"></div>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="shrink-0 p-6 bg-[#1e2139] border-t border-[#5ce1e6]/20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <BookingGuard onAuthenticated={() => setIsBookingModalOpen(true)}>
                                    {(triggerAuthCheck) => (
                                        <button
                                            onClick={() => {
                                                const error = validateBookingForm();
                                                if (error) {
                                                    setBookingError(error);
                                                    return;
                                                }
                                                setBookingError(null);
                                                setIsMobileDateOpen(false);
                                                handleBookingClick(triggerAuthCheck);
                                            }}
                                            disabled={!checkIn || !checkOut}
                                            className="w-full py-4 bg-linear-to-r from-[#3d9da3] to-[#2d6b9e] hover:from-[#4ab3b9] hover:to-[#3788b3] text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                        >
                                            Continue to Book
                                        </button>
                                    )}
                                </BookingGuard>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
