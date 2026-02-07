import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, AdminStats, getAllBookings } from '@/services/adminApi';
import { useAuth } from '@/hooks/useAuth';
import { Users, Home, Calendar, Star, TrendingUp, DollarSign, AlertCircle, CheckCircle, ArrowRight, Shield, Activity, Eye } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [bookingType, setBookingType] = useState<'Journey' | 'Property'>('Journey');

    useEffect(() => {
        loadStats();
        loadRecentBookings();
    }, []);

    const loadRecentBookings = async () => {
        try {
            // Fetch first page of bookings to show recent activity
            const response = await getAllBookings({ page: 1, limit: 5 });
            setRecentBookings(response.bookings || []);
        } catch (err) {
            console.error('Failed to load recent bookings', err);
        }
    }

    const filteredBookings = recentBookings.filter(b => b.journeyModel === bookingType || (!b.journeyModel && bookingType === 'Property'));

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminStats();
            setStats(data);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load admin stats';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a0e27' }}>
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: '#2d3548' }}></div>
                        <div className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin" style={{ borderColor: '#5CE1E6' }}></div>
                    </div>
                    <p className="text-base font-medium" style={{ color: '#B0B7C3' }}>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a0e27' }}>
                <div className="text-center rounded-3xl p-10 shadow-xl max-w-md" style={{ background: '#1e2139', border: '1px solid #2d3548' }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertCircle className="w-10 h-10" style={{ color: '#ef4444' }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3" style={{ color: 'white' }}>Access Denied</h3>
                    <p className="mb-6" style={{ color: '#B0B7C3' }}>{error || 'You do not have admin privileges'}</p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 text-white rounded-xl font-medium transition-colors" style={{ background: '#5CE1E6' }}>
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0e27' }}>
            {/* Premium Hero Section */}
            <section className="relative text-white pt-12 pb-32 overflow-hidden" style={{ background: '#1e2139' }}>
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e2139] via-[#0a0e27] to-[#1e2139]"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(92, 225, 230, 0.1)' }}></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" style={{ background: 'rgba(138, 43, 226, 0.05)' }}></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 backdrop-blur-2xl rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: 'rgba(92, 225, 230, 0.1)', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                                <Shield className="w-10 h-10" style={{ color: '#5CE1E6' }} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2 tracking-tight">
                                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, #5CE1E6, #4ADE80)' }}>{user?.name?.split(' ')[0] || 'Admin'}</span>
                                </h1>
                                <p className="text-lg font-light" style={{ color: '#B0B7C3' }}>
                                    Platform overview & management dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 backdrop-blur-md px-4 py-2 rounded-full" style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-emerald-400">System Operational</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 pb-12">
                {/* Premium Stats Grid */}
                <div className="-mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-20 mb-10">
                    {/* Users Card */}
                    <div className="rounded-3xl p-6 shadow-xl backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300" style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                                <Users className="w-7 h-7" style={{ color: '#60a5fa' }} />
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                                <TrendingUp className="w-3 h-3" />
                                +{stats.users.newThisWeek}
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1 tracking-tight" style={{ color: 'white' }}>{stats.users.total.toLocaleString()}</h3>
                        <p className="font-medium" style={{ color: '#B0B7C3' }}>Total registered users</p>
                    </div>

                    {/* Properties Card */}
                    <div className="rounded-3xl p-6 shadow-xl backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300" style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                                <Home className="w-7 h-7" style={{ color: '#34d399' }} />
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full`} style={stats.properties.pending > 0
                                ? { background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }
                                : { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                                {stats.properties.pending > 0 ? (
                                    <>{stats.properties.pending} pending</>
                                ) : (
                                    <>✓ All synced</>
                                )}
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1 tracking-tight" style={{ color: 'white' }}>{stats.properties.total.toLocaleString()}</h3>
                        <p className="font-medium" style={{ color: '#B0B7C3' }}>Listed properties</p>
                    </div>

                    {/* Bookings Card */}
                    <div className="rounded-3xl p-6 shadow-xl backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300" style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                                <Calendar className="w-7 h-7" style={{ color: '#a855f7' }} />
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                                {stats.bookings.confirmed} active
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1 tracking-tight" style={{ color: 'white' }}>{stats.bookings.total.toLocaleString()}</h3>
                        <p className="font-medium" style={{ color: '#B0B7C3' }}>Total bookings</p>
                    </div>

                    {/* Revenue Card */}
                    <div className="text-white rounded-3xl p-6 shadow-xl backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1e2139 100%)', border: '1px solid rgba(92, 225, 230, 0.3)' }}>
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md" style={{ background: 'rgba(92, 225, 230, 0.2)', border: '1px solid rgba(92, 225, 230, 0.3)' }}>
                                <DollarSign className="w-7 h-7" style={{ color: '#5CE1E6' }} />
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-full backdrop-blur-md" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                Total
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">₹{stats.bookings.monthRevenue.toLocaleString()}</h3>
                        <p className="font-medium" style={{ color: '#B0B7C3' }}>Monthly generated revenue</p>
                    </div>
                </div>

                {/* Management Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <Link
                        to="/admin/users"
                        className="group rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-2xl"
                        style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                                    <Users className="w-8 h-8" style={{ color: '#60a5fa' }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>User Management</h3>
                                <p className="mb-6 max-w-sm" style={{ color: '#B0B7C3' }}>Oversee user accounts, manage roles, and handle verification permissions.</p>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' }}>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        {stats.users.activeUsers} active
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300" style={{ background: 'rgba(92, 225, 230, 0.1)' }}>
                                <ArrowRight className="w-5 h-5 transition-colors duration-300" style={{ color: '#5CE1E6' }} />
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/homestays"
                        className="group rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-2xl"
                        style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                                    <Home className="w-8 h-8" style={{ color: '#34d399' }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>Property Approval</h3>
                                <p className="mb-6 max-w-sm" style={{ color: '#B0B7C3' }}>Review incoming property listings and manage existing inventory status.</p>
                                <div className="flex items-center gap-3">
                                    {stats.properties.pending > 0 && (
                                        <span className="inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)' }}>
                                            {stats.properties.pending} Review Pending
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: '#B0B7C3', background: 'rgba(255, 255, 255, 0.05)' }}>
                                        <Eye className="w-3.5 h-3.5" />
                                        {stats.properties.active} live
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300" style={{ background: 'rgba(92, 225, 230, 0.1)' }}>
                                <ArrowRight className="w-5 h-5 transition-colors duration-300" style={{ color: '#5CE1E6' }} />
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/bookings"
                        className="group rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-2xl"
                        style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                                    <Calendar className="w-8 h-8" style={{ color: '#a855f7' }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>Booking Oversight</h3>
                                <p className="mb-6 max-w-sm" style={{ color: '#B0B7C3' }}>Monitor booking flow, status changes, and revenue streams.</p>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' }}>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {stats.bookings.confirmed} confirmed
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300" style={{ background: 'rgba(92, 225, 230, 0.1)' }}>
                                <ArrowRight className="w-5 h-5 transition-colors duration-300" style={{ color: '#5CE1E6' }} />
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/reviews"
                        className="group rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-2xl"
                        style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
                                    <Star className="w-8 h-8" style={{ color: '#fb923c' }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>Review Moderation</h3>
                                <p className="mb-6 max-w-sm" style={{ color: '#B0B7C3' }}>Ensure quality by moderating reviews and handling reports.</p>
                                <div className="flex items-center gap-3">
                                    {stats.reviews.reported > 0 && (
                                        <span className="inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)' }}>
                                            {stats.reviews.reported} Reported
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: '#B0B7C3', background: 'rgba(255, 255, 255, 0.05)' }}>
                                        <Star className="w-3.5 h-3.5 fill-amber-500" style={{ color: '#fbbf24' }} />
                                        {stats.reviews.averageRating.toFixed(1)} avg
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300" style={{ background: 'rgba(92, 225, 230, 0.1)' }}>
                                <ArrowRight className="w-5 h-5 transition-colors duration-300" style={{ color: '#5CE1E6' }} />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Overview */}
                    <div className="lg:col-span-1 rounded-3xl shadow-sm p-8 h-full" style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(92, 225, 230, 0.1)' }}>
                                <Activity className="w-5 h-5" style={{ color: '#5CE1E6' }} />
                            </div>
                            <h2 className="text-xl font-bold" style={{ color: 'white' }}>Live Pulse</h2>
                        </div>

                        <div className="space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>

                            <div className="relative pl-14">
                                <div className="absolute left-3 top-2 w-6 h-0.5" style={{ background: 'rgba(74, 222, 128, 0.2)' }}></div>
                                <div className="absolute left-4 top-0.5 w-4 h-4 rounded-full border-4 z-10" style={{ background: '#1e2139', borderColor: '#4ade80' }}></div>
                                <h3 className="text-2xl font-bold" style={{ color: 'white' }}>{stats.users.newToday}</h3>
                                <p className="text-sm font-medium mb-1" style={{ color: 'white' }}>New Registrations</p>
                                <p className="text-xs" style={{ color: '#B0B7C3' }}>Users joined the platform today</p>
                            </div>

                            <div className="relative pl-14">
                                <div className="absolute left-3 top-2 w-6 h-0.5" style={{ background: 'rgba(59, 130, 246, 0.2)' }}></div>
                                <div className="absolute left-4 top-0.5 w-4 h-4 rounded-full border-4 z-10" style={{ background: '#1e2139', borderColor: '#60a5fa' }}></div>
                                <h3 className="text-2xl font-bold" style={{ color: 'white' }}>₹{stats.bookings.todayRevenue.toLocaleString()}</h3>
                                <p className="text-sm font-medium mb-1" style={{ color: 'white' }}>Today's Revenue</p>
                                <p className="text-xs" style={{ color: '#B0B7C3' }}>₹{stats.bookings.weekRevenue.toLocaleString()} generated this week</p>
                            </div>

                            <div className="relative pl-14">
                                <div className="absolute left-3 top-2 w-6 h-0.5" style={{ background: 'rgba(251, 191, 36, 0.2)' }}></div>
                                <div className="absolute left-4 top-0.5 w-4 h-4 rounded-full border-4 z-10" style={{ background: '#1e2139', borderColor: '#fbbf24' }}></div>
                                <h3 className="text-2xl font-bold" style={{ color: 'white' }}>{stats.properties.pending + stats.reviews.reported}</h3>
                                <p className="text-sm font-medium mb-1" style={{ color: 'white' }}>Action Items</p>
                                <p className="text-xs" style={{ color: '#B0B7C3' }}>Pending reviews & reports</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Bookings Section */}
                    <div className="lg:col-span-2 rounded-3xl shadow-sm p-8 h-full" style={{ background: '#1e2139', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(92, 225, 230, 0.1)' }}>
                                    <Calendar className="w-5 h-5" style={{ color: '#5CE1E6' }} />
                                </div>
                                <h2 className="text-xl font-bold" style={{ color: 'white' }}>Recent Transactions</h2>
                            </div>
                            {/* Toggle */}
                            <div className="p-1.5 rounded-xl flex self-start sm:self-auto" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                <button
                                    onClick={() => setBookingType('Journey')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all`}
                                    style={bookingType === 'Journey'
                                        ? { background: '#1e2139', color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
                                        : { color: '#B0B7C3' }}
                                >
                                    Journeys
                                </button>
                                <button
                                    onClick={() => setBookingType('Property')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all`}
                                    style={bookingType === 'Property'
                                        ? { background: '#1e2139', color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
                                        : { color: '#B0B7C3' }}
                                >
                                    Properties
                                </button>
                            </div>
                        </div>

                        {filteredBookings.length === 0 ? (
                            <div className="text-center py-20 rounded-2xl border border-dashed" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                <p className="font-medium" style={{ color: '#B0B7C3' }}>No recent {bookingType.toLowerCase()} bookings found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs font-bold uppercase tracking-wider border-b" style={{ color: '#B0B7C3', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                            <th className="pb-4 pl-4">ID</th>
                                            <th className="pb-4">{bookingType === 'Journey' ? 'Journey' : 'Property'}</th>
                                            <th className="pb-4">User</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 text-right pr-4">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking._id} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-4 pl-4 text-xs font-mono transition-colors" style={{ color: '#B0B7C3' }}>
                                                    #{booking._id.slice(-6)}
                                                </td>
                                                <td className="py-4">
                                                    <span className="block font-bold truncate max-w-[200px]" style={{ color: 'white' }}>{booking.journeyTitle || booking.journeyId?.title || 'Unknown Title'}</span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, rgba(92, 225, 230, 0.2), rgba(92, 225, 230, 0.1))', color: '#5CE1E6' }}>
                                                            {booking.memberId?.name?.[0] || 'U'}
                                                        </div>
                                                        <span className="text-sm font-medium" style={{ color: '#B0B7C3' }}>{booking.memberId?.name || booking.memberName || 'Unknown User'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize`} style={booking.bookingStatus === 'confirmed'
                                                        ? { background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }
                                                        : booking.bookingStatus === 'pending'
                                                            ? { background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }
                                                            : { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                                                        {booking.bookingStatus}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4 text-right font-bold transition-colors" style={{ color: 'white' }}>
                                                    ₹{booking.totalAmount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
