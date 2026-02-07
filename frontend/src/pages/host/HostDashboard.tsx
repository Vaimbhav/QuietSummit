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
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)' }}>
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'rgba(92,225,230,0.2)' }}></div>
                        <div className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin" style={{ borderColor: '#5CE1E6' }}></div>
                    </div>
                    <p className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)' }}>
                <div className="text-center backdrop-blur-md rounded-2xl p-8 shadow-xl border max-w-md" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                    <h2 className="text-xl font-bold text-white mb-4">Error loading dashboard</h2>
                    <p className="mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>{error || 'Failed to fetch host profile'}</p>
                    <button
                        onClick={loadDashboardData}
                        className="px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#ffffff', boxShadow: '0 10px 24px rgba(92,225,230,0.2)' }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)' }}>
            {/* Premium Hero Section - Mobile Optimized */}
            <section className="relative text-white pt-8 lg:pt-16 pb-32 sm:pb-20 md:pb-28 lg:pb-32 overflow-hidden">
                {/* Background gradient overlay */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(92,225,230,0.1) 0%, rgba(74,144,226,0.1) 100%)' }} />
                <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
                    <div className="flex items-start justify-between gap-4 lg:gap-6 mb-4">
                        <div className="flex items-start gap-4 lg:gap-6 flex-1 min-w-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 backdrop-blur-md rounded-2xl flex items-center justify-center border flex-shrink-0" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', borderColor: 'rgba(255,255,255,0.2)' }}>
                                <Home className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" style={{ color: '#0a0e27' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 lg:mb-3 leading-tight">
                                    Welcome back, <span style={{ color: '#5CE1E6' }}>{user?.name?.split(' ')[0] || 'Host'}</span>!
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                    Manage your properties and bookings overview
                                </p>
                            </div>
                        </div>
                        {/* Quick Actions - Desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/dashboard?view=traveler"
                                className="flex items-center gap-2 px-6 py-3.5 text-white border font-semibold rounded-xl hover:shadow-xl transition-all backdrop-blur-sm hover:scale-105"
                                style={{ background: 'rgba(10,14,39,0.6)', borderColor: 'rgba(92,225,230,0.5)', boxShadow: '0 0 20px rgba(92,225,230,0.18)' }}
                            >
                                Switch to Traveling
                            </Link>
                            <Link
                                to="/host/homestays/new"
                                className="flex items-center gap-2 px-6 py-3.5 font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                                style={{ backgroundColor: '#5CE1E6', backgroundImage: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#ffffff', border: 'none', boxShadow: '0 10px 24px rgba(92,225,230,0.25)' }}
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
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl shadow-xl transition-all"
                            style={{ backgroundColor: '#5CE1E6', backgroundImage: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#ffffff', border: 'none', boxShadow: '0 10px 24px rgba(92,225,230,0.25)' }}
                        >
                            <Plus className="w-5 h-5" />
                            Add Property
                        </Link>
                        <Link
                            to="/dashboard?view=traveler"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-white border font-semibold rounded-xl transition-all backdrop-blur-sm hover:scale-105"
                            style={{ background: 'rgba(10,14,39,0.6)', borderColor: 'rgba(92,225,230,0.5)', boxShadow: '0 0 20px rgba(92,225,230,0.18)' }}
                        >
                            Switch to Traveling
                        </Link>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 sm:px-8 lg:px-16 pb-8">
                {/* Premium Stats Grid - Mobile Optimized */}
                <div className="-mt-20 sm:-mt-20 md:-mt-20 lg:-mt-20 mb-10 lg:mb-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 relative z-20">
                    {/* Revenue Card - Spans 2 columns on mobile, 1 on desktop */}
                    <div className="col-span-2 lg:col-span-1 backdrop-blur-md rounded-2xl shadow-xl border p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                            <DollarSign className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">₹{stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Revenue</p>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                            <span>↗</span> ₹{stats.monthlyRevenue.toLocaleString()} <span style={{ color: 'rgba(255,255,255,0.5)' }}>this month</span>
                        </span>
                    </div>

                    {/* Properties Card */}
                    <div className="backdrop-blur-md rounded-2xl shadow-xl border p-5 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)' }}>
                            <Home className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalProperties}</h3>
                        <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Properties</p>
                        {stats.pendingProperties > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-400 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                {stats.pendingProperties} pending
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                ✓ All active
                            </span>
                        )}
                    </div>

                    {/* Bookings Card */}
                    <div className="backdrop-blur-md rounded-2xl shadow-xl border p-5 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
                            <Calendar className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalBookings}</h3>
                        <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Bookings</p>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <span className="font-medium">{stats.completedBookings}</span>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>done</span>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                            <span className="font-medium">{stats.upcomingBookings}</span>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>upcoming</span>
                        </div>
                    </div>

                    {/* Rating Card */}
                    <div className="backdrop-blur-md rounded-2xl shadow-xl border p-5 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
                            <Star className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.averageRating.toFixed(1)}</h3>
                        <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Rating</p>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${star <= Math.round(stats.averageRating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : ''}`}
                                    style={star > Math.round(stats.averageRating) ? { color: 'rgba(255,255,255,0.3)' } : {}}
                                />
                            ))}
                            <span className="text-xs ml-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>({stats.totalReviews})</span>
                        </div>
                    </div>
                </div>

                {/* Performance Section */}
                <div className="backdrop-blur-md rounded-2xl shadow-xl border p-6 sm:p-8 mb-8 mt-6 lg:mt-8 hover:shadow-2xl transition-shadow" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Response Rate</span>
                                <span className="text-sm font-bold text-white">{stats.responseRate}%</span>
                            </div>
                            <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <div
                                    className="h-2.5 rounded-full transition-all"
                                    style={{ width: `${stats.responseRate}%`, background: '#10b981' }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Acceptance Rate</span>
                                <span className="text-sm font-bold text-white">{stats.acceptanceRate}%</span>
                            </div>
                            <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <div
                                    className="h-2.5 rounded-full transition-all"
                                    style={{ width: `${stats.acceptanceRate}%`, background: '#3b82f6' }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Completion Rate</span>
                                <span className="text-sm font-bold text-white">98%</span>
                            </div>
                            <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <div className="h-2.5 rounded-full transition-all" style={{ width: '98%', background: '#8b5cf6' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Recent Properties */}
                    <div className="backdrop-blur-md rounded-2xl shadow-xl border hover:shadow-2xl transition-shadow" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                        <div className="p-5 sm:p-6" style={{ borderBottom: '1px solid rgba(92,225,230,0.2)' }}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-bold text-white">Recent Properties</h2>
                                <Link
                                    to="/host/homestays"
                                    className="text-sm font-medium flex items-center gap-1 group"
                                    style={{ color: 'rgba(255,255,255,0.7)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
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
                                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-colors group"
                                            style={{ background: 'transparent' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(92,225,230,0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                                {property.images?.[0]?.url ? (
                                                    <img
                                                        src={property.images[0].url}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Home className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.4)' }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-white truncate mb-1">
                                                    {property.title}
                                                </h3>
                                                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                    {property.address?.city}, {property.address?.state}
                                                </p>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-xs font-semibold text-white">
                                                        ₹{property.pricing?.basePrice}/night
                                                    </span>
                                                    <span
                                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${property.status === 'approved'
                                                            ? 'text-green-400'
                                                            : property.status === 'pending_review'
                                                                ? 'text-amber-400'
                                                                : ''}`}
                                                        style={{ background: 'rgba(255,255,255,0.1)' }}
                                                    >
                                                        {property.status === 'approved' ? 'Active' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(92,225,230,0.1)' }}>
                                        <Home className="w-8 h-8" style={{ color: '#5CE1E6' }} />
                                    </div>
                                    <h3 className="text-sm font-semibold text-white mb-2">No properties yet</h3>
                                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Start by adding your first property</p>
                                    <Link
                                        to="/host/homestays/new"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                                        style={{ backgroundColor: '#5CE1E6', backgroundImage: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#ffffff', border: 'none' }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Property
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="backdrop-blur-md rounded-2xl shadow-xl border hover:shadow-2xl transition-shadow" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                        <div className="p-6" style={{ borderBottom: '1px solid rgba(92,225,230,0.2)' }}>
                            <h2 className="text-xl font-bold text-white">Quick Links</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    to="/host/homestays"
                                    className="group p-6 rounded-xl hover:shadow-xl transition-all border"
                                    style={{ background: 'rgba(92,225,230,0.1)', borderColor: 'rgba(92,225,230,0.3)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(92,225,230,0.3)'}
                                >
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <Home className="w-6 h-6" style={{ color: '#5CE1E6' }} />
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">Properties</h3>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Manage listings</p>
                                </Link>
                                <Link
                                    to="/host/bookings"
                                    className="group p-6 rounded-xl hover:shadow-xl transition-all border"
                                    style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.3)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'}
                                >
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <Calendar className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">Bookings</h3>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>View reservations</p>
                                </Link>
                                <Link
                                    to="/host/calendar"
                                    className="group p-6 rounded-xl hover:shadow-xl transition-all border"
                                    style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'}
                                >
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <Calendar className="w-6 h-6 text-green-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">Calendar</h3>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Set availability</p>
                                </Link>
                                <Link
                                    to="/host/reviews"
                                    className="group p-6 rounded-xl hover:shadow-xl transition-all border"
                                    style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'}
                                >
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <Star className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">Reviews</h3>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Guest feedback</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                {recentBookings.length > 0 && (
                    <div className="mt-8 backdrop-blur-md rounded-2xl shadow-xl border hover:shadow-2xl transition-shadow" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                        <div className="p-6" style={{ borderBottom: '1px solid rgba(92,225,230,0.2)' }}>
                            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(92,225,230,0.1)' }}>
                            {recentBookings.map((booking, idx) => (
                                <div
                                    key={booking._id}
                                    className="p-6 transition-colors"
                                    style={{ borderTop: idx > 0 ? '1px solid rgba(92,225,230,0.1)' : 'none' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(92,225,230,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #8b5cf6 100%)' }}>
                                                {booking.guestName?.charAt(0) || 'G'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-white truncate">{booking.guestName}</h3>
                                                <p className="text-xs mt-1 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-white flex-shrink-0">₹{booking.totalPrice?.toLocaleString()}</span>
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
