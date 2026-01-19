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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
                    <p className="text-gray-600">Manage your travel bookings and reservations</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                aria-label="Filter by booking type"
                            >
                                <option value="all">All Bookings</option>
                                <option value="journey">Journeys</option>
                                <option value="property">Properties</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Bookings List */}
                {bookings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-600 mb-6">Start exploring and book your next adventure!</p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                to="/journeys"
                                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                Browse Journeys
                            </Link>
                            <Link
                                to="/homestays"
                                className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
                            >
                                Browse Properties
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
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
                                <div key={booking._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image */}
                                        <div className="md:w-64 h-48 md:h-auto shrink-0">
                                            <img
                                                src={image || '/images/placeholder.jpg'}
                                                alt={item?.title || 'Booking'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                                                            {isProperty ? 'Property' : 'Journey'}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                        {item?.title || 'Untitled'}
                                                    </h3>
                                                    <p className="text-gray-600 flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {location}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">₹{booking.totalPrice}</p>
                                                    <p className="text-sm text-gray-500">Total</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Check-in</p>
                                                        <p className="font-medium text-gray-900">{formatDate(booking.checkIn)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Check-out</p>
                                                        <p className="font-medium text-gray-900">{formatDate(booking.checkOut)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Guests</p>
                                                        <p className="font-medium text-gray-900">{booking.guests}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-4">
                                                <Link
                                                    to={isProperty
                                                        ? `/homestays/${item?._id}`
                                                        : `/journeys/${item?._id}`
                                                    }
                                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                                                >
                                                    View Details
                                                </Link>
                                                {booking.status === 'confirmed' && (
                                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
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
