import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Users, Mail, Phone, Download, Share2, Sparkles, Clock, Home } from 'lucide-react';
import { getBookingById } from '../services/api';

export default function BookingConfirmation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!id || id === 'undefined') {
                console.error('Invalid booking ID:', id);
                setError('Invalid booking ID');
                setLoading(false);
                return;
            }

            try {
                const response = await getBookingById(id);
                setBooking(response.data);
            } catch (error: any) {
                console.error('Error fetching booking:', error);
                console.error('Error response:', error.response);
                setError(error.response?.data?.message || 'Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your booking...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/journeys')}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Browse Journeys
                    </button>
                </div>
            </div>
        );
    }

    const bookingRef = `QS${booking._id.toString().slice(-8).toUpperCase()}`;

    const handleDownload = () => {
        window.print();
    };

    const handleShare = async () => {
        const shareData = {
            title: `Trip to ${booking.destination}`,
            text: `Check out my upcoming trip to ${booking.destination} at ${booking.journeyTitle}!`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Booking link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                {/* Floating celebration elements */}
                <div className="absolute top-10 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-float"></div>
                <div className="absolute top-20 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-float animation-delay-1000"></div>
                <div className="absolute top-32 left-1/3 w-4 h-4 bg-blue-400 rounded-full animate-float animation-delay-2000"></div>
                <div className="absolute top-16 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-float animation-delay-3000"></div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-20 relative z-10 max-w-5xl">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    {/* Success Icon with Glow */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="relative inline-block mb-6"
                    >
                        <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                            <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2.5} />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-6xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
                    >
                        {booking.bookingStatus === 'confirmed' ? 'Booking Confirmed! 🎉' :
                            booking.bookingStatus === 'pending' ? 'Booking Pending ⏳' :
                                'Booking Received 📝'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                    >
                        {booking.bookingStatus === 'confirmed'
                            ? <>Your adventure to <span className="font-semibold text-gray-900">{booking.destination}</span> is all set!</>
                            : <>Your booking for <span className="font-semibold text-gray-900">{booking.destination}</span> is being processed. We'll confirm shortly!</>
                        }
                    </motion.p>

                    {/* Booking Reference Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="inline-block"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative px-8 py-6 bg-white rounded-2xl shadow-xl">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-primary-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Booking Reference</p>
                                        <p className="text-3xl font-black text-gray-900 tracking-wider">{bookingRef}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Journey Details - Takes 2 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-primary-600" />
                                Journey Details
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Location */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Destination</p>
                                    <p className="text-lg font-bold text-gray-900">{booking.journeyTitle}</p>
                                    <p className="text-sm text-gray-600">{booking.destination}</p>
                                </div>

                                {/* Travel Dates */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Travel Dates</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(booking.startDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-600">{booking.duration} days journey</p>
                                </div>

                                {/* Travelers */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Travelers</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {booking.numberOfTravelers} {booking.numberOfTravelers === 1 ? 'Traveler' : 'Travelers'}
                                    </p>
                                    <p className="text-sm text-gray-600 capitalize">{booking.roomPreference} room</p>
                                </div>

                                {/* Payment */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                                    <p className={`text-lg font-bold flex items-center gap-2 ${booking.paymentStatus === 'paid' ? 'text-green-600' :
                                        booking.paymentStatus === 'pending' ? 'text-yellow-600' :
                                            'text-gray-600'
                                        }`}>
                                        <CheckCircle className="w-5 h-5" />
                                        {booking.paymentStatus === 'paid' ? 'Paid' :
                                            booking.paymentStatus === 'pending' ? 'Pending' :
                                                booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                    </p>
                                    <p className="text-sm text-gray-600">₹{booking.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions - Takes 1 column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-4"
                    >
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleDownload}
                                    className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Receipt
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share Booking
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl p-6 text-white">
                            <Sparkles className="w-8 h-8 mb-3" />
                            <h3 className="text-lg font-bold mb-2">Earn Rewards!</h3>
                            <p className="text-sm text-blue-50 mb-4">Share your experience and earn 500 points</p>
                            <button className="w-full px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                                Refer a Friend
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Travelers List */}
                {booking.travelers && booking.travelers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary-600" />
                            Travelers
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {booking.travelers.map((traveler: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{traveler.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {traveler.age} years • {traveler.gender}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* What's Next Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8 mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary-600" />
                        What's Next?
                    </h2>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-600 via-blue-500 to-purple-600"></div>

                        <div className="space-y-8">
                            {/* Step 1 */}
                            <div className="relative flex gap-6">
                                <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Check Your Email</h3>
                                    <p className="text-gray-600 mb-2">
                                        We've sent a confirmation email to <span className="font-semibold text-gray-900">{booking.memberEmail}</span> with all the details
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        Completed
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex gap-6">
                                <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Prepare for Your Trip</h3>
                                    <p className="text-gray-600 mb-2">
                                        We'll send you a detailed packing list and pre-trip information 30 days before departure
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        Upcoming
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex gap-6">
                                <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Get Ready for Adventure</h3>
                                    <p className="text-gray-600 mb-2">
                                        Our team will contact you 7 days before departure with final details
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                        <Sparkles className="w-4 h-4" />
                                        Scheduled
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        View Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/journeys')}
                        className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-200"
                    >
                        Browse More Journeys
                    </button>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-center"
                >
                    <p className="text-gray-600 mb-4 font-medium">Need help or have questions?</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a
                            href="mailto:Nagendrarajput9753@gmail.com"
                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors group"
                        >
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            Nagendrarajput9753@gmail.com
                        </a>
                        <a
                            href="tel:+919968086660"
                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors group"
                        >
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                <Phone className="w-5 h-5" />
                            </div>
                            +91 99680 86660
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
