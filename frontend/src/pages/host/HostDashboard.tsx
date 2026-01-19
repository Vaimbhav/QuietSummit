import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHostStats, getHostProperties, getHostBookings } from '@/services/hostApi';
import { useAuth } from '@/hooks/useAuth';
import {
    Home, Calendar, DollarSign, Star,
    ArrowRight, Plus, ChevronRight
} from 'lucide-react';

interface HostStats {
    totalProperties: number;
    activeProperties: number;
    pendingProperties: number;
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    acceptanceRate: number;
}

export default function HostDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<HostStats | null>(null);
    const [recentProperties, setRecentProperties] = useState<any[]>([]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsData, propertiesData, bookingsData] = await Promise.all([
                getHostStats(),
                getHostProperties({ limit: 3 }),
                getHostBookings({ limit: 5, status: 'confirmed' })
            ]);
            setStats(statsData);
            setRecentProperties(propertiesData.properties || []);
            setRecentBookings(bookingsData.bookings || []);
        } catch (error: any) {
            console.error('Error loading dashboard:', error);
            setError(error.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-base font-medium text-neutral-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
                <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 max-w-md">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4">Error loading dashboard</h2>
                    <p className="text-neutral-600 mb-6">{error || 'Failed to fetch host profile'}</p>
                    <button
                        onClick={loadDashboardData}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Premium Hero Section - Mobile Optimized */}
            <section className="relative bg-primary-600 text-white pt-8 lg:pt-16 pb-32 sm:pb-20 md:pb-28 lg:pb-32 overflow-hidden">
                <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
                    <div className="flex items-start justify-between gap-4 lg:gap-6 mb-4">
                        <div className="flex items-start gap-4 lg:gap-6 flex-1 min-w-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0">
                                <Home className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 lg:mb-3 leading-tight">
                                    Welcome back,<br className="sm:hidden" /> {user?.name?.split(' ')[0] || 'Host'}!
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-white/90">
                                    Manage your properties and bookings overview
                                </p>
                            </div>
                        </div>
                        {/* Quick Actions - Desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/dashboard?view=traveler"
                                className="flex items-center gap-2 px-5 py-3 bg-white/10 text-white border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
                            >
                                Switch to Traveling
                            </Link>
                            <Link
                                to="/host/homestays/new"
                                className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg shadow-black/5"
                            >
                                <Plus className="w-5 h-5" />
                                Add Property
                            </Link>
                        </div>
                    </div>
                    {/* Mobile Quick Actions */}
                    <div className="md:hidden flex flex-col gap-3 mt-4">
                        <Link
                            to="/host/homestays/new"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Property
                        </Link>
                        <Link
                            to="/dashboard?view=traveler"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                            Switch to Traveling
                        </Link>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 sm:px-8 lg:px-16 pb-8">
                {/* Premium Stats Grid - Mobile Optimized */}
                <div className="-mt-20 sm:-mt-20 md:-mt-20 lg:-mt-20 mb-10 lg:mb-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8 relative z-20">
                    {/* Revenue Card - Spans 2 columns on mobile, 1 on desktop */}
                    <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl shadow-md border border-neutral-100 p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                            <DollarSign className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">₹{stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-xs sm:text-sm text-neutral-600 font-medium mb-2">Total Revenue</p>
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            <span>↗</span> ₹{stats.monthlyRevenue.toLocaleString()} <span className="text-neutral-500">this month</span>
                        </span>
                    </div>

                    {/* Properties Card */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-5 sm:p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                            <Home className="w-6 h-6 text-blue-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">{stats.totalProperties}</h3>
                        <p className="text-xs sm:text-sm text-neutral-600 font-medium mb-2">Properties</p>
                        {stats.pendingProperties > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                {stats.pendingProperties} pending
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                ✓ All active
                            </span>
                        )}
                    </div>

                    {/* Bookings Card */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-5 sm:p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                            <Calendar className="w-6 h-6 text-purple-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">{stats.totalBookings}</h3>
                        <p className="text-xs sm:text-sm text-neutral-600 font-medium mb-2">Bookings</p>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                            <span className="font-medium">{stats.completedBookings}</span>
                            <span className="text-neutral-400">done</span>
                            <span className="text-neutral-400">•</span>
                            <span className="font-medium">{stats.upcomingBookings}</span>
                            <span className="text-neutral-400">upcoming</span>
                        </div>
                    </div>

                    {/* Rating Card */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-5 sm:p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                            <Star className="w-6 h-6 text-amber-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">{stats.averageRating.toFixed(1)}</h3>
                        <p className="text-xs sm:text-sm text-neutral-600 font-medium mb-2">Rating</p>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${star <= Math.round(stats.averageRating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-neutral-300'
                                        }`}
                                />
                            ))}
                            <span className="text-xs text-neutral-500 ml-1.5">({stats.totalReviews})</span>
                        </div>
                    </div>
                </div>

                {/* Performance Section */}
                <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 sm:p-8 mb-8 mt-6 lg:mt-8 hover:shadow-lg transition-shadow">
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-6">Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-neutral-600">Response Rate</span>
                                <span className="text-sm font-bold text-neutral-900">{stats.responseRate}%</span>
                            </div>
                            <div className="w-full bg-neutral-100 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full transition-all"
                                    style={{ width: `${stats.responseRate}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-neutral-600">Acceptance Rate</span>
                                <span className="text-sm font-bold text-neutral-900">{stats.acceptanceRate}%</span>
                            </div>
                            <div className="w-full bg-neutral-100 rounded-full h-2.5">
                                <div
                                    className="bg-blue-500 h-2.5 rounded-full transition-all"
                                    style={{ width: `${stats.acceptanceRate}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-neutral-600">Completion Rate</span>
                                <span className="text-sm font-bold text-neutral-900">98%</span>
                            </div>
                            <div className="w-full bg-neutral-100 rounded-full h-2.5">
                                <div className="bg-purple-500 h-2.5 rounded-full transition-all" style={{ width: '98%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Recent Properties */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                        <div className="p-5 sm:p-6 border-b border-neutral-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-bold text-neutral-900">Recent Properties</h2>
                                <Link
                                    to="/host/homestays"
                                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 group"
                                >
                                    View All
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5 sm:p-6">
                            {recentProperties.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {recentProperties.map((property) => (
                                        <Link
                                            key={property._id}
                                            to={`/homestays/${property.slug}`}
                                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-neutral-50 transition-colors group"
                                        >
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {property.images?.[0]?.url ? (
                                                    <img
                                                        src={property.images[0].url}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Home className="w-6 h-6 text-neutral-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-neutral-900 truncate mb-1">
                                                    {property.title}
                                                </h3>
                                                <p className="text-xs text-neutral-500 mb-2">
                                                    {property.address?.city}, {property.address?.state}
                                                </p>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-xs font-semibold text-neutral-900">
                                                        ₹{property.pricing?.basePrice}/night
                                                    </span>
                                                    <span
                                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${property.status === 'approved'
                                                            ? 'bg-green-50 text-green-700'
                                                            : property.status === 'pending_review'
                                                                ? 'bg-amber-50 text-amber-700'
                                                                : 'bg-neutral-100 text-neutral-600'
                                                            }`}
                                                    >
                                                        {property.status === 'approved' ? 'Active' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Home className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">No properties yet</h3>
                                    <p className="text-sm text-gray-500 mb-4">Start by adding your first property</p>
                                    <Link
                                        to="/host/homestays/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Property
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Quick Links</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    to="/host/homestays"
                                    className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl hover:shadow-md transition-all border border-blue-100"
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Home className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Properties</h3>
                                    <p className="text-xs text-gray-600">Manage listings</p>
                                </Link>
                                <Link
                                    to="/host/bookings"
                                    className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl hover:shadow-md transition-all border border-purple-100"
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Calendar className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Bookings</h3>
                                    <p className="text-xs text-gray-600">View reservations</p>
                                </Link>
                                <Link
                                    to="/host/calendar"
                                    className="group p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl hover:shadow-md transition-all border border-green-100"
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Calendar className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Calendar</h3>
                                    <p className="text-xs text-gray-600">Set availability</p>
                                </Link>
                                <Link
                                    to="/host/reviews"
                                    className="group p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl hover:shadow-md transition-all border border-amber-100"
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Star className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Reviews</h3>
                                    <p className="text-xs text-gray-600">Guest feedback</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                {recentBookings.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentBookings.map((booking) => (
                                <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                {booking.guestName?.charAt(0) || 'G'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">{booking.guestName}</h3>
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 flex-shrink-0">₹{booking.totalPrice?.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
