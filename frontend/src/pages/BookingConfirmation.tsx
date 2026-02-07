import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Users, Mail, Phone, Download, Share2, Sparkles, Clock, Home } from 'lucide-react';
import { getBookingById } from '../services/api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

export default function BookingConfirmation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

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
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e27' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4" style={{ borderColor: 'rgba(61, 157, 163, 0.3)', borderTopColor: '#3d9da3' }}></div>
                    <p className="font-medium" style={{ color: '#B0B7C3' }}>Loading your booking...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0a0e27' }}>
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-96 h-96 rounded-full filter blur-3xl opacity-10 animate-blob" style={{ background: '#ff6464' }}></div>
                    <div className="absolute top-40 right-10 w-96 h-96 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000" style={{ background: '#ff8888' }}></div>
                </div>
                <div className="text-center max-w-md mx-auto px-4 relative z-10">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(255, 100, 100, 0.15)' }}>
                        <svg className="w-10 h-10" style={{ color: '#ff6464' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>Booking Not Found</h2>
                    <p className="mb-6" style={{ color: '#B0B7C3' }}>{error || 'The booking you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/journeys')}
                        className="px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                        style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}
                    >
                        Browse Journeys
                    </button>
                </div>
            </div>
        );
    }

    const bookingRef = `QS${booking._id.toString().slice(-8).toUpperCase()}`;

    const handleDownloadPDF = async () => {
        if (isDownloading) return;

        setIsDownloading(true);

        try {
            // Get token from localStorage in the same way as api.ts
            let token = '';
            const userDataStr = localStorage.getItem('quietsummit_user');
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    token = userData.token || '';
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }

            if (!token) {
                alert('Please log in to download your receipt.');
                setIsDownloading(false);
                return;
            }

            const response = await axios.get(
                `${API_URL}/bookings/${booking._id}/receipt/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob',
                    timeout: 60000,
                }
            );

            // Create blob with proper PDF type
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const filename = `QuietSummit-Receipt-${bookingRef}.pdf`;

            // Detect if mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // For mobile: open in new tab instead of downloading
                window.open(url, '_blank');
                setTimeout(() => {
                    alert('Receipt opened in new tab. Tap the share icon to save or download.');
                }, 500);
            } else {
                // For desktop: download directly
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            // Clean up
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch (error: any) {
            console.error('Error downloading receipt:', error);
            alert('Failed to download receipt. Please try again.');
        } finally {
            setIsDownloading(false);
        }
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
        <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0e27' }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 rounded-full filter blur-3xl opacity-10 animate-blob" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}></div>
                <div className="absolute top-40 right-10 w-96 h-96 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000" style={{ background: 'linear-gradient(135deg, #2d6b9e 0%, #1e5a7d 100%)' }}></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-1000" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #5CE1E6 100%)' }}></div>
                <div className="absolute top-10 left-1/4 w-3 h-3 rounded-full animate-float" style={{ background: '#5CE1E6', opacity: 0.4 }}></div>
                <div className="absolute top-20 right-1/4 w-2 h-2 rounded-full animate-float animation-delay-1000" style={{ background: '#3d9da3', opacity: 0.4 }}></div>
                <div className="absolute top-32 left-1/3 w-4 h-4 rounded-full animate-float animation-delay-2000" style={{ background: '#2d6b9e', opacity: 0.4 }}></div>
                <div className="absolute top-16 right-1/3 w-3 h-3 rounded-full animate-float animation-delay-3000" style={{ background: '#5CE1E6', opacity: 0.4 }}></div>
            </div>

            <div className="container mx-auto px-6 py-12 md:py-20 relative z-10 max-w-5xl">
                {/* Premium Header - Receipt Style */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-12"
                >
                    <div className="backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden" style={{ background: 'rgba(30, 33, 57, 0.95)', border: '2px solid rgba(92, 225, 230, 0.2)' }}>
                        <div className="relative px-6 md:px-12 py-8 md:py-10 text-center text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}>
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(92, 225, 230, 0.1)' }}></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" style={{ background: 'rgba(10, 14, 39, 0.2)' }}></div>

                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl shadow-xl mb-3 ring-4 ring-white/30"
                                >
                                    <CheckCircle className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-xs font-bold tracking-[0.3em] mb-2 opacity-90 uppercase"
                                >
                                    QuietSummit
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-3xl md:text-4xl font-black mb-2 tracking-tight"
                                >
                                    {booking.bookingStatus === 'confirmed' ? 'Booking Confirmed!' :
                                        booking.bookingStatus === 'pending' ? 'Booking Pending' :
                                            'Thank You!'}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-base md:text-lg font-semibold opacity-95 mb-3"
                                >
                                    {booking.memberName || booking.travelers?.[0]?.name || 'Valued Traveler'}
                                </motion.p>

                                {/* Booking Reference in Header */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="inline-block"
                                >
                                    <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl px-5 py-2.5 shadow-lg">
                                        <div className="text-[10px] font-bold opacity-80 mb-0.5 tracking-wider">BOOKING REFERENCE</div>
                                        <div className="text-xl md:text-2xl font-black tracking-widest">{bookingRef}</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Thank You Content */}
                        <div className="px-6 md:px-12 py-5 md:py-6" style={{ background: 'rgba(10, 14, 39, 0.6)' }}>
                            <div className="max-w-3xl mx-auto text-center space-y-3">
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-base md:text-lg leading-relaxed font-semibold"
                                    style={{ color: '#ffffff' }}
                                >
                                    Your journey to <span className="font-black" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #5CE1E6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{booking.destination}</span> is confirmed.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="pt-1 flex flex-wrap justify-center gap-2.5"
                                >
                                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-sm text-sm" style={{ background: 'rgba(92, 225, 230, 0.15)', color: '#5CE1E6', border: '2px solid rgba(92, 225, 230, 0.3)' }}>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Payment Confirmed</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-sm text-sm" style={{ background: 'rgba(61, 157, 163, 0.15)', color: '#3d9da3', border: '2px solid rgba(61, 157, 163, 0.3)' }}>
                                        <Mail className="w-4 h-4" />
                                        <span>Confirmation Sent</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
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
                        <div className="backdrop-blur-2xl rounded-3xl shadow-2xl p-8 md:p-10 hover:shadow-3xl transition-shadow duration-300" style={{ background: 'rgba(30, 33, 57, 0.9)', border: '2px solid rgba(92, 225, 230, 0.2)' }}>
                            <h2 className="text-3xl font-black mb-8 flex items-center gap-3 pb-4" style={{ color: '#ffffff', borderBottom: '2px solid rgba(92, 225, 230, 0.2)' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}>
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                Journey Details
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Location */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium" style={{ color: '#5CE1E6' }}>Destination</p>
                                    <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{booking.journeyTitle}</p>
                                    <p className="text-sm" style={{ color: '#B0B7C3' }}>{booking.destination}</p>
                                </div>

                                {/* Travel Dates */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium" style={{ color: '#5CE1E6' }}>Travel Dates</p>
                                    <p className="text-lg font-bold" style={{ color: '#ffffff' }}>
                                        {new Date(booking.startDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-sm" style={{ color: '#B0B7C3' }}>{booking.duration} days journey</p>
                                </div>

                                {/* Travelers */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium" style={{ color: '#5CE1E6' }}>Travelers</p>
                                    <p className="text-lg font-bold" style={{ color: '#ffffff' }}>
                                        {booking.numberOfTravelers} {booking.numberOfTravelers === 1 ? 'Traveler' : 'Travelers'}
                                    </p>
                                    <p className="text-sm capitalize" style={{ color: '#B0B7C3' }}>{booking.roomPreference} room</p>
                                </div>

                                {/* Payment */}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium" style={{ color: '#5CE1E6' }}>Payment Status</p>
                                    <p className="text-lg font-bold flex items-center gap-2" style={{
                                        color: booking.paymentStatus === 'paid' ? '#5CE1E6' :
                                            booking.paymentStatus === 'pending' ? '#fbbf24' :
                                                '#B0B7C3'
                                    }}>
                                        <CheckCircle className="w-5 h-5" />
                                        {booking.paymentStatus === 'paid' ? 'Paid' :
                                            booking.paymentStatus === 'pending' ? 'Pending' :
                                                booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                    </p>
                                    <p className="text-sm" style={{ color: '#B0B7C3' }}>₹{booking.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions - Takes 1 column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-5"
                    >
                        <div className="backdrop-blur-2xl rounded-3xl shadow-2xl p-7 hover:shadow-3xl transition-shadow duration-300" style={{ background: 'rgba(30, 33, 57, 0.9)', border: '2px solid rgba(92, 225, 230, 0.2)' }}>
                            <h3 className="text-xl font-black mb-5 pb-3" style={{ color: '#ffffff', borderBottom: '2px solid rgba(92, 225, 230, 0.2)' }}>Quick Actions</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading}
                                    className="w-full px-5 py-4 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}
                                >
                                    <Download className="w-5 h-5" />
                                    {isDownloading ? 'Downloading...' : 'Download Receipt'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-full px-5 py-4 font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3"
                                    style={{ background: 'rgba(92, 225, 230, 0.1)', color: '#5CE1E6', border: '2px solid rgba(92, 225, 230, 0.3)' }}
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share Booking
                                </button>
                            </div>
                        </div>

                        {/* Earn Rewards - Commented out for now */}
                        {/* <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-7 text-white relative overflow-hidden group hover:shadow-3xl transition-shadow duration-300">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-black mb-2">Earn Rewards!</h3>
                                <p className="text-sm text-white/90 mb-5 leading-relaxed">Share your experience and earn 500 points towards your next adventure</p>
                                <button className="w-full px-5 py-3 bg-dark-light text-primary-300 border border-dark-border font-bold rounded-xl hover:bg-white/95 transition-all hover:shadow-xl hover:scale-105">
                                    Refer a Friend
                                </button>
                            </div>
                        </div> */}
                    </motion.div>
                </div>

                {/* Travelers List */}
                {booking.travelers && booking.travelers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8 mb-8"
                        style={{ background: 'rgba(30, 33, 57, 0.8)', border: '1px solid rgba(92, 225, 230, 0.2)' }}
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#ffffff' }}>
                            <Users className="w-6 h-6" style={{ color: '#5CE1E6' }} />
                            Travelers
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {booking.travelers.map((traveler: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 rounded-2xl"
                                    style={{ background: 'rgba(61, 157, 163, 0.1)', border: '1px solid rgba(92, 225, 230, 0.2)' }}
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold" style={{ color: '#ffffff' }}>{traveler.name}</p>
                                        <p className="text-sm" style={{ color: '#B0B7C3' }}>
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
                        <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, #3d9da3 0%, #2d6b9e 50%, #1e5a7d 100%)' }}></div>

                        <div className="space-y-8">
                            {/* Step 1 */}
                            <div className="relative flex gap-6">
                                <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg shrink-0" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #3d9da3 100%)' }}>
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-bold mb-1" style={{ color: '#ffffff' }}>Check Your Email</h3>
                                    <p className="mb-2" style={{ color: '#B0B7C3' }}>
                                        We've sent a confirmation email to <span className="font-semibold" style={{ color: '#5CE1E6' }}>{booking.memberEmail}</span> with all the details
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(92, 225, 230, 0.15)', color: '#5CE1E6' }}>
                                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#5CE1E6' }}></div>
                                        Completed
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex gap-6">
                                <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg shrink-0" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}>
                                    2
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-bold mb-1" style={{ color: '#ffffff' }}>Prepare for Your Trip</h3>
                                    <p className="mb-2" style={{ color: '#B0B7C3' }}>
                                        We'll send you a detailed packing list and pre-trip information 30 days before departure
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(61, 157, 163, 0.15)', color: '#3d9da3' }}>
                                        <Clock className="w-4 h-4" />
                                        Upcoming
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex gap-6">
                                <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg shrink-0" style={{ background: 'linear-gradient(135deg, #2d6b9e 0%, #1e5a7d 100%)' }}>
                                    3
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-bold mb-1" style={{ color: '#ffffff' }}>Get Ready for Adventure</h3>
                                    <p className="mb-2" style={{ color: '#B0B7C3' }}>
                                        Our team will contact you 7 days before departure with final details
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(45, 107, 158, 0.15)', color: '#2d6b9e' }}>
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
                        className="px-8 py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}
                    >
                        <Home className="w-5 h-5" />
                        View Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/journeys')}
                        className="px-8 py-4 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        style={{ background: 'rgba(92, 225, 230, 0.1)', color: '#5CE1E6', border: '2px solid rgba(92, 225, 230, 0.3)' }}
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
                    <p className="mb-4 font-medium" style={{ color: '#B0B7C3' }}>Need help or have questions?</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a
                            href="mailto:Nagendrarajput9753@gmail.com"
                            className="flex items-center gap-2 font-semibold transition-colors group"
                            style={{ color: '#5CE1E6' }}
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(92, 225, 230, 0.15)' }}>
                                <Mail className="w-5 h-5" />
                            </div>
                            Nagendrarajput9753@gmail.com
                        </a>
                        <a
                            href="tel:+919968086660"
                            className="flex items-center gap-2 font-semibold transition-colors group"
                            style={{ color: '#5CE1E6' }}
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(92, 225, 230, 0.15)' }}>
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
