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
        <div className="min-h-screen bg-neutral-50">
            {/* Premium Header Section */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
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
                <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 mb-10 lg:mb-12">
                    {/* Mobile Dropdown */}
                    <div className="md:hidden">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-5 py-4 pr-12 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-neutral-300 bg-white appearance-none cursor-pointer text-neutral-900 font-bold text-base shadow-sm"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 1rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                            }}
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
                                className={`px-5 py-2.5 rounded-xl font-semibold transition-all capitalize ${filter === status
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                {status === 'all' ? 'All Bookings' : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Booking Type Tabs */}
                <div className="flex gap-4 mb-8 border-b border-neutral-200">
                    <button
                        onClick={() => setBookingType('Property')}
                        className={`pb-3 px-2 font-bold text-lg transition-colors border-b-2 ${bookingType === 'Property'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        Homestays
                    </button>
                    <button
                        onClick={() => setBookingType('Journey')}
                        className={`pb-3 px-2 font-bold text-lg transition-colors border-b-2 ${bookingType === 'Journey'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        Journeys
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-12 lg:p-16 text-center">
                        <div className="bg-neutral-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-12 h-12 text-neutral-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-3">No {bookingType.toLowerCase()} bookings found</h3>
                        <p className="text-neutral-600 text-lg">Bookings for your {bookingType.toLowerCase()}s will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4 lg:space-y-5">
                        {filteredBookings.map((booking) => (
                            <div key={booking._id} className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden hover:shadow-lg transition-shadow">
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
                                                <h3 className="text-lg lg:text-xl font-bold text-neutral-900 mb-1">
                                                    {booking.propertyId?.title || (bookingType === 'Journey' ? 'Unknown Journey' : 'Unknown Property')}
                                                </h3>
                                                <p className="text-neutral-500 text-xs text-xs">ID: {booking._id.slice(-8)} • {bookingType}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-xl lg:text-2xl font-bold text-neutral-900">₹{booking.totalPrice.toLocaleString()}</p>
                                                <p className="text-xs text-neutral-500 font-medium">Total</p>
                                            </div>
                                        </div>

                                        {/* Guest Info & Dates Combined */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                            {/* Guest Info */}
                                            <div className="bg-neutral-50 rounded-xl p-4">
                                                <h4 className="font-bold text-neutral-900 mb-3 text-sm">Guest Information</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-neutral-400" />
                                                        <span className="text-sm text-neutral-700">{booking.guestId?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-neutral-400" />
                                                        <span className="text-xs text-neutral-600">{booking.guestId?.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-neutral-400" />
                                                        <span className="text-sm text-neutral-700">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Booking Dates */}
                                            <div className="bg-primary-50 rounded-xl p-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                            <Calendar className="w-5 h-5 text-primary-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-primary-700 uppercase">Check-in</p>
                                                            <p className="font-bold text-neutral-900 text-sm">{formatDate(booking.checkIn)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                            <Calendar className="w-5 h-5 text-primary-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-primary-700 uppercase">Check-out</p>
                                                            <p className="font-bold text-neutral-900 text-sm">{formatDate(booking.checkOut)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-200">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                        disabled={updatingStatus === booking._id}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold disabled:opacity-50 transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                        disabled={updatingStatus === booking._id}
                                                        className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-semibold disabled:opacity-50 transition-colors"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                    disabled={updatingStatus === booking._id}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:opacity-50 transition-colors"
                                                >
                                                    Mark Completed
                                                </button>
                                            )}
                                            <Link
                                                to={`/homestays/${booking.propertyId?._id}`}
                                                className="px-4 py-2 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 text-sm font-semibold transition-colors"
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
