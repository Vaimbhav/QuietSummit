import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, BookingItem } from '../services/profileApi';
import Loader from '../components/common/Loader';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function MyBookings() {
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'journey' | 'property'>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadBookings();
    }, [filter, statusFilter]);

    const loadBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const params: any = {};
            if (filter !== 'all') params.type = filter;
            if (statusFilter !== 'all') params.status = statusFilter;

            const data = await getMyBookings(params);
            setBookings(data.bookings);
        } catch (error: any) {
            console.error('Error loading bookings:', error);
            setError(error.response?.data?.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-400/20 text-green-300 border border-green-400/30';
            case 'pending':
                return 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30';
            case 'cancelled':
                return 'bg-red-400/20 text-red-300 border border-red-400/30';
            case 'completed':
                return 'bg-blue-400/20 text-blue-300 border border-blue-400/30';
            default:
                return 'bg-neutral-400/20 text-neutral-300 border border-neutral-400/30';
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
        <div className="min-h-screen bg-dark py-6">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">My Bookings</h1>
                    <p className="text-neutral-300 text-sm">Manage your travel bookings and reservations</p>
                </div>

                <div className="glass-effect rounded-xl shadow-sm p-3 md:p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-200 mb-1.5">Type</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="w-full px-4 py-3 pr-12 border-2 border-dark-border rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 appearance-none cursor-pointer font-semibold shadow-sm hover:shadow-md transition-all hover:border-primary-300 bg-dark-card text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_1rem] bg-no-repeat"
                                aria-label="Filter by booking type"
                            >
                                <option value="all">All Bookings</option>
                                <option value="journey">Journeys</option>
                                <option value="property">Properties</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2.5 border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300 appearance-none cursor-pointer font-semibold shadow-sm hover:shadow-md transition-all hover:border-primary-400/50 bg-dark-card text-white text-sm bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_1rem] bg-no-repeat"
                                aria-label="Filter by booking status"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2.5 rounded-lg mb-5 text-sm">
                        {error}
                    </div>
                )}

                {/* Bookings List */}
                {bookings.length === 0 ? (
                    <div className="glass-effect rounded-xl shadow-sm p-10 text-center border border-dark-border">
                        <Calendar className="w-14 h-14 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">No bookings found</h3>
                        <p className="text-neutral-300 text-sm mb-5">Start exploring and book your next adventure!</p>
                        <div className="flex gap-3 justify-center">
                            <Link
                                to="/journeys"
                                className="btn-premium px-5 py-2.5 text-sm rounded-lg"
                            >
                                Browse Journeys
                            </Link>
                            <Link
                                to="/homestays"
                                className="px-5 py-2.5 border border-primary-300 text-primary-300 rounded-lg hover:bg-primary-300/10 text-sm font-semibold transition-colors"
                            >
                                Browse Properties
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.map((booking) => {
                            const isProperty = booking.propertyId !== undefined;
                            const item = isProperty ? booking.propertyId : booking.journeyId;

                            let image = '/images/placeholder.jpg';
                            if (isProperty && item?.images?.[0]) {
                                image = typeof item.images[0] === 'string'
                                    ? item.images[0]
                                    : item.images[0].url;
                            } else if (!isProperty && item?.images?.[0]) {
                                image = typeof item.images[0] === 'string' ? item.images[0] : '/images/placeholder.jpg';
                            }

                            const location = isProperty
                                ? (booking.propertyId?.address
                                    ? `${booking.propertyId.address.city}, ${booking.propertyId.address.state}`
                                    : 'Location unavailable')
                                : (booking.journeyId?.location || 'Location unavailable');

                            return (
                                <div key={booking._id} className="glass-effect rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-dark-border">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image */}
                                        <div className="md:w-56 h-40 md:h-auto shrink-0">
                                            <img
                                                src={image || '/images/placeholder.jpg'}
                                                alt={item?.title || 'Booking'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="px-2.5 py-1 bg-primary-300/20 text-primary-300 rounded-full text-xs font-medium border border-primary-300/30">
                                                            {isProperty ? 'Property' : 'Journey'}
                                                        </span>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-white mb-1">
                                                        {item?.title || 'Untitled'}
                                                    </h3>
                                                    <p className="text-neutral-300 text-sm flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {location}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-white">₹{booking.totalPrice}</p>
                                                    <p className="text-xs text-neutral-200">Total</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-dark-border">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-neutral-300" />
                                                    <div>
                                                        <p className="text-xs text-neutral-200">Check-in</p>
                                                        <p className="font-medium text-white text-sm">{formatDate(booking.checkIn)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-neutral-300" />
                                                    <div>
                                                        <p className="text-xs text-neutral-200">Check-out</p>
                                                        <p className="font-medium text-white text-sm">{formatDate(booking.checkOut)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-neutral-300" />
                                                    <div>
                                                        <p className="text-xs text-neutral-200">Guests</p>
                                                        <p className="font-medium text-white text-sm">{booking.guests}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <Link
                                                    to={isProperty
                                                        ? `/homestays/${item?._id}`
                                                        : `/journeys/${item?._id}`
                                                    }
                                                    className="btn-premium px-4 py-2 text-sm rounded-lg"
                                                >
                                                    View Details
                                                </Link>
                                                {booking.status === 'confirmed' && (
                                                    <button className="px-4 py-2 border border-dark-border text-neutral-300 rounded-lg hover:bg-dark-card text-sm font-medium transition-colors">
                                                        Cancel Booking
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
