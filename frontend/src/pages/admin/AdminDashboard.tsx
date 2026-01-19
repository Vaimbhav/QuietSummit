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
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-base font-medium text-neutral-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="text-center bg-white rounded-3xl p-10 shadow-xl border border-gray-100 max-w-md">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h3>
                    <p className="text-gray-600 mb-6">{error || 'You do not have admin privileges'}</p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Premium Hero Section */}
            <section className="relative bg-neutral-900 text-white pt-12 pb-32 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                                <Shield className="w-10 h-10 text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2 tracking-tight">
                                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-emerald-200">{user?.name?.split(' ')[0] || 'Admin'}</span>
                                </h1>
                                <p className="text-lg text-neutral-400 font-light">
                                    Platform overview & management dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
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
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-neutral-200/50 border border-neutral-100 backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-600" />
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                                <TrendingUp className="w-3 h-3" />
                                +{stats.users.newThisWeek}
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold text-neutral-900 mb-1 tracking-tight">{stats.users.total.toLocaleString()}</h3>
                        <p className="text-neutral-500 font-medium">Total registered users</p>
                    </div>

                    {/* Properties Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-neutral-200/50 border border-neutral-100 backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <Home className="w-7 h-7 text-emerald-600" />
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${stats.properties.pending > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                {stats.properties.pending > 0 ? (
                                    <>{stats.properties.pending} pending</>
                                ) : (
                                    <>✓ All synced</>
                                )}
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold text-neutral-900 mb-1 tracking-tight">{stats.properties.total.toLocaleString()}</h3>
                        <p className="text-neutral-500 font-medium">Listed properties</p>
                    </div>

                    {/* Bookings Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-neutral-200/50 border border-neutral-100 backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-purple-600" />
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full">
                                {stats.bookings.confirmed} active
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold text-neutral-900 mb-1 tracking-tight">{stats.bookings.total.toLocaleString()}</h3>
                        <p className="text-neutral-500 font-medium">Total bookings</p>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-linear-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl p-6 shadow-xl shadow-neutral-900/20 border border-neutral-800 backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <DollarSign className="w-7 h-7 text-emerald-400" />
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 text-white px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                Total
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">₹{stats.bookings.monthRevenue.toLocaleString()}</h3>
                        <p className="text-neutral-400 font-medium">Monthly generated revenue</p>
                    </div>
                </div>

                {/* Management Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <Link
                        to="/admin/users"
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-2">User Management</h3>
                                <p className="text-neutral-500 mb-6 max-w-sm">Oversee user accounts, manage roles, and handle verification permissions.</p>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 bg-neutral-50 px-3 py-1.5 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        {stats.users.activeUsers} active
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/homestays"
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Home className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Property Approval</h3>
                                <p className="text-neutral-500 mb-6 max-w-sm">Review incoming property listings and manage existing inventory status.</p>
                                <div className="flex items-center gap-3">
                                    {stats.properties.pending > 0 && (
                                        <span className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                                            {stats.properties.pending} Review Pending
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 bg-neutral-50 px-3 py-1.5 rounded-lg">
                                        <Eye className="w-3.5 h-3.5" />
                                        {stats.properties.active} live
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-300">
                                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/bookings"
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Booking Oversight</h3>
                                <p className="text-neutral-500 mb-6 max-w-sm">Monitor booking flow, status changes, and revenue streams.</p>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 bg-neutral-50 px-3 py-1.5 rounded-lg">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        {stats.bookings.confirmed} confirmed
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/reviews"
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Star className="w-8 h-8 text-orange-600 bg-orange-50" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Review Moderation</h3>
                                <p className="text-neutral-500 mb-6 max-w-sm">Ensure quality by moderating reviews and handling reports.</p>
                                <div className="flex items-center gap-3">
                                    {stats.reviews.reported > 0 && (
                                        <span className="inline-flex items-center gap-2 text-sm font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
                                            {stats.reviews.reported} Reported
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 bg-neutral-50 px-3 py-1.5 rounded-lg">
                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                        {stats.reviews.averageRating.toFixed(1)} avg
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300">
                                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Overview */}
                    <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                                <Activity className="w-5 h-5 text-neutral-600" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Live Pulse</h2>
                        </div>

                        <div className="space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-neutral-100"></div>

                            <div className="relative pl-14">
                                <div className="absolute left-3 top-2 w-6 h-0.5 bg-green-500/20"></div>
                                <div className="absolute left-4 top-0.5 w-4 h-4 rounded-full bg-white border-4 border-green-500 z-10"></div>
                                <h3 className="text-2xl font-bold text-neutral-900">{stats.users.newToday}</h3>
                                <p className="text-sm font-medium text-neutral-900 mb-1">New Registrations</p>
                                <p className="text-xs text-neutral-500">Users joined the platform today</p>
                            </div>

                            <div className="relative pl-14">
                                <div className="absolute left-3 top-2 w-6 h-0.5 bg-blue-500/20"></div>
                                <div className="absolute left-4 top-0.5 w-4 h-4 rounded-full bg-white border-4 border-blue-500 z-10"></div>
                                <h3 className="text-2xl font-bold text-neutral-900">₹{stats.bookings.todayRevenue.toLocaleString()}</h3>
                                <p className="text-sm font-medium text-neutral-900 mb-1">Today's Revenue</p>
                                <p className="text-xs text-neutral-500">₹{stats.bookings.weekRevenue.toLocaleString()} generated this week</p>
                            </div>

                            <div className="relative pl-14">
                                <div className="absolute left-3 top-2 w-6 h-0.5 bg-amber-500/20"></div>
                                <div className="absolute left-4 top-0.5 w-4 h-4 rounded-full bg-white border-4 border-amber-500 z-10"></div>
                                <h3 className="text-2xl font-bold text-neutral-900">{stats.properties.pending + stats.reviews.reported}</h3>
                                <p className="text-sm font-medium text-neutral-900 mb-1">Action Items</p>
                                <p className="text-xs text-neutral-500">Pending reviews & reports</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Bookings Section */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 h-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-neutral-600" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900">Recent Transactions</h2>
                            </div>
                            {/* Toggle */}
                            <div className="bg-neutral-100 p-1.5 rounded-xl flex self-start sm:self-auto">
                                <button
                                    onClick={() => setBookingType('Journey')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${bookingType === 'Journey'
                                        ? 'bg-white text-neutral-900 shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    Journeys
                                </button>
                                <button
                                    onClick={() => setBookingType('Property')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${bookingType === 'Property'
                                        ? 'bg-white text-neutral-900 shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    Properties
                                </button>
                            </div>
                        </div>

                        {filteredBookings.length === 0 ? (
                            <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                <p className="text-neutral-500 font-medium">No recent {bookingType.toLowerCase()} bookings found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                                            <th className="pb-4 pl-4">ID</th>
                                            <th className="pb-4">{bookingType === 'Journey' ? 'Journey' : 'Property'}</th>
                                            <th className="pb-4">User</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 text-right pr-4">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking._id} className="group hover:bg-neutral-50/80 transition-colors">
                                                <td className="py-4 pl-4 text-xs font-mono text-neutral-400 group-hover:text-primary-600 transition-colors">
                                                    #{booking._id.slice(-6)}
                                                </td>
                                                <td className="py-4">
                                                    <span className="block font-bold text-neutral-900 truncate max-w-[200px]">{booking.journeyTitle || booking.journeyId?.title || 'Unknown Title'}</span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-600">
                                                            {booking.memberId?.name?.[0] || 'U'}
                                                        </div>
                                                        <span className="text-sm font-medium text-neutral-600">{booking.memberId?.name || booking.memberName || 'Unknown User'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${booking.bookingStatus === 'confirmed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : booking.bookingStatus === 'pending'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {booking.bookingStatus}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4 text-right font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
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
