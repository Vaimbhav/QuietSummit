import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHostBookings, updateBookingStatus, HostBooking } from '../../services/hostApi';
import { Calendar, Users, Mail } from 'lucide-react';
import Loader from '../../components/common/Loader';

export default function HostBookings() {
    const [bookings, setBookings] = useState<HostBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [bookingType, setBookingType] = useState<'Property' | 'Journey'>('Property');

    useEffect(() => {
        loadBookings();
    }, [filter]);

    const filteredBookings = bookings.filter(b => (b as any).journeyModel === bookingType || (!b.hasOwnProperty('journeyModel') && bookingType === 'Property'));

    const loadBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const data = await getHostBookings(params);
            setBookings(data.bookings);
        } catch (error: any) {
            console.error('Error loading bookings:', error);
            setError(error.response?.data?.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
        setUpdatingStatus(bookingId);
        try {
            await updateBookingStatus(bookingId, newStatus);
            setBookings(prev =>
                prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b)
            );
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Failed to update booking status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white">
            {/* Premium Header Section */}
            <div className="text-white py-16 sm:py-20 lg:py-24" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)' }}>
                <div className="container mx-auto px-6 sm:px-8 lg:px-16">
                    <div className="flex items-start gap-5 lg:gap-8">
                        <div className="w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0">
                            <Calendar className="w-8 h-8 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-3xl lg:text-5xl font-extrabold mb-4 leading-tight">
                                Bookings
                            </h1>
                            <p className="text-base sm:text-base lg:text-lg text-white/95 font-medium flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Manage your property reservations
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 sm:px-8 lg:px-16 py-10 lg:py-16">

                {/* Filters */}
                <div className="bg-[#1e2139] rounded-2xl shadow-md border border-[#5ce1e6]/15 p-6 lg:p-8 mb-10 lg:mb-12">
                    {/* Mobile Dropdown */}
                    <div className="md:hidden">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-5 py-4 pr-12 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all bg-[#0a0e27]/60 appearance-none cursor-pointer text-white font-bold text-base shadow-sm bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_1rem] bg-no-repeat"
                        >
                            <option value="all">All Bookings</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    {/* Desktop Buttons */}
                    <div className="hidden md:flex flex-wrap gap-3">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all capitalize ${filter === status
                                    ? 'text-[#0a0e27] shadow-md'
                                    : 'bg-[#0a0e27]/60 text-[#B0B7C3] hover:bg-[#0a0e27]/80 border border-[#5ce1e6]/15'
                                    }`}
                                style={filter === status ? { background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)' } : undefined}
                            >
                                {status === 'all' ? 'All Bookings' : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Booking Type Tabs */}
                <div className="flex gap-4 mb-8 border-b border-[#5ce1e6]/15">
                    <button
                        onClick={() => setBookingType('Property')}
                        className={`pb-3 px-2 font-bold text-lg transition-colors border-b-2 ${bookingType === 'Property'
                            ? 'border-[#5CE1E6] text-[#5CE1E6]'
                            : 'border-transparent text-[#B0B7C3] hover:text-white'
                            }`}
                    >
                        Homestays
                    </button>
                    <button
                        onClick={() => setBookingType('Journey')}
                        className={`pb-3 px-2 font-bold text-lg transition-colors border-b-2 ${bookingType === 'Journey'
                            ? 'border-[#5CE1E6] text-[#5CE1E6]'
                            : 'border-transparent text-[#B0B7C3] hover:text-white'
                            }`}
                    >
                        Journeys
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-[#2a1113] border border-red-500/40 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="bg-[#1e2139] rounded-2xl shadow-lg border border-[#5ce1e6]/15 p-12 lg:p-16 text-center">
                        <div className="bg-[#0a0e27]/60 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#5ce1e6]/20">
                            <Calendar className="w-12 h-12 text-[#5CE1E6]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">No {bookingType.toLowerCase()} bookings found</h3>
                        <p className="text-[#B0B7C3] text-lg">Bookings for your {bookingType.toLowerCase()}s will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4 lg:space-y-5">
                        {filteredBookings.map((booking) => (
                            <div key={booking._id} className="bg-[#1e2139] rounded-2xl shadow-md border border-[#5ce1e6]/15 overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    {/* Property Image */}
                                    <div className="md:w-56 lg:w-64 h-48 md:h-full shrink-0 relative">
                                        <img
                                            src={booking.propertyId?.images?.[0]?.url || '/images/placeholder.jpg'}
                                            alt={booking.propertyId?.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 lg:p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold capitalize mb-2 ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                                <h3 className="text-lg lg:text-xl font-bold text-white mb-1">
                                                    {booking.propertyId?.title || (bookingType === 'Journey' ? 'Unknown Journey' : 'Unknown Property')}
                                                </h3>
                                                <p className="text-[#B0B7C3] text-xs text-xs">ID: {booking._id.slice(-8)} • {bookingType}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-xl lg:text-2xl font-bold text-white">₹{booking.totalPrice.toLocaleString()}</p>
                                                <p className="text-xs text-[#B0B7C3] font-medium">Total</p>
                                            </div>
                                        </div>

                                        {/* Guest Info & Dates Combined */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                            {/* Guest Info */}
                                            <div className="bg-[#0a0e27]/60 rounded-xl p-4 border border-[#5ce1e6]/15">
                                                <h4 className="font-bold text-white mb-3 text-sm">Guest Information</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-[#5CE1E6]/80" />
                                                        <span className="text-sm text-[#B0B7C3]">{booking.guestId?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-[#5CE1E6]/80" />
                                                        <span className="text-xs text-[#B0B7C3]">{booking.guestId?.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-[#5CE1E6]/80" />
                                                        <span className="text-sm text-[#B0B7C3]">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Booking Dates */}
                                            <div className="bg-[#0a0e27]/60 rounded-xl p-4 border border-[#5ce1e6]/15">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#0a0e27] rounded-lg flex items-center justify-center shadow-sm border border-[#5ce1e6]/20">
                                                            <Calendar className="w-5 h-5 text-[#5CE1E6]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-[#5CE1E6] uppercase">Check-in</p>
                                                            <p className="font-bold text-white text-sm">{formatDate(booking.checkIn)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#0a0e27] rounded-lg flex items-center justify-center shadow-sm border border-[#5ce1e6]/20">
                                                            <Calendar className="w-5 h-5 text-[#5CE1E6]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-[#5CE1E6] uppercase">Check-out</p>
                                                            <p className="font-bold text-white text-sm">{formatDate(booking.checkOut)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-[#5ce1e6]/15">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                        disabled={updatingStatus === booking._id}
                                                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-semibold disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                        disabled={updatingStatus === booking._id}
                                                        className="px-5 py-2.5 border border-red-400/50 text-red-300 rounded-xl hover:bg-red-500/10 text-sm font-semibold disabled:opacity-50 transition-all"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                    disabled={updatingStatus === booking._id}
                                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                                                >
                                                    Mark Completed
                                                </button>
                                            )}
                                            <Link
                                                to={`/homestays/${booking.propertyId?._id}`}
                                                className="px-5 py-2.5 border border-[#5ce1e6]/25 text-[#B0B7C3] rounded-xl hover:bg-[#0a0e27]/60 text-sm font-semibold transition-all"
                                            >
                                                View Property
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
