import { useEffect, useState } from 'react';
import { getAllBookings, AdminBooking } from '@/services/adminApi';
import { Search, Filter, Calendar, MapPin, DollarSign, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Eye, Shield } from 'lucide-react';
import Loader from '@components/common/Loader';

export default function BookingOversight() {
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        bookingStatus: '',
        paymentStatus: '',
        type: 'all' // 'all', 'Journey', 'Property'
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1
    });

    useEffect(() => {
        loadBookings();
    }, [page, filters.bookingStatus, filters.paymentStatus]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await getAllBookings({
                page,
                limit: 10,
                bookingStatus: filters.bookingStatus || undefined,
                paymentStatus: filters.paymentStatus || undefined
            });
            setBookings(response.bookings);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
            case 'pending': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
            case 'cancelled': return 'bg-red-50 text-red-700 ring-1 ring-red-600/20';
            case 'completed': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
            default: return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20';
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filters.type === 'all') return true;
        return booking.journeyModel === filters.type || (!booking.journeyModel && filters.type === 'Property'); // Fallback logic matching dashboard
    });

    if (loading && page === 1 && bookings.length === 0) {
        return (
            <div className="min-h-screen pt-24 flex justify-center bg-gray-50">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Premium Header */}
            <div className="bg-neutral-900 text-white pt-24 pb-32 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"></div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-emerald-400 font-medium tracking-wide text-sm uppercase">Admin Console</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Booking Oversight</h1>
                            <p className="text-neutral-400 text-lg">Detailed transaction history and management</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm text-neutral-400">Total Records</span>
                                <span className="text-2xl font-bold text-white">{pagination.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-12">
                {/* Control Bar */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl">
                    <div className="flex bg-gray-100/50 p-1.5 rounded-xl w-full md:w-auto self-stretch">
                        {['all', 'Journey', 'Property'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilters(prev => ({ ...prev, type }))}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${filters.type === type
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {type === 'all' ? 'All View' : type === 'Journey' ? 'Journeys' : 'Properties'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:flex-none">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <select
                                value={filters.bookingStatus}
                                onChange={(e) => setFilters(prev => ({ ...prev, bookingStatus: e.target.value, paymentStatus: '' }))}
                                className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-full hover:border-gray-300 transition-colors cursor-pointer appearance-none"
                            >
                                <option value="">Filter by Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronLeft className="h-4 w-4 text-gray-400 -rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Booking Identity</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Dates & Duration</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Info</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Value</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="group hover:bg-gray-50/60 transition-colors duration-200">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${booking.journeyModel === 'Property'
                                                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                                                    : 'bg-purple-50 text-purple-600 ring-1 ring-purple-100'
                                                    }`}>
                                                    {booking.journeyModel === 'Property' ? <MapPin className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 line-clamp-1 text-[15px]">{booking.journeyId?.title || 'Unknown Booking'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 font-mono">
                                                            #{booking._id.slice(-6)}
                                                        </span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-gray-500 capitalize">{booking.journeyModel || 'Booking'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <div className="text-xs text-gray-500 pl-6">
                                                    to {new Date(booking.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                                                    {booking.memberId?.name?.[0] || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900">{booking.memberId?.name}</span>
                                                    <span className="text-xs text-gray-500">{booking.memberId?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize shadow-sm ${getStatusStyles(booking.bookingStatus)}`}>
                                                    {booking.bookingStatus === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                                                    {booking.bookingStatus === 'pending' && <Clock className="w-3 h-3" />}
                                                    {booking.bookingStatus === 'cancelled' && <XCircle className="w-3 h-3" />}
                                                    {booking.bookingStatus}
                                                </span>
                                                {booking.paymentStatus === 'paid' && (
                                                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-600 pl-1">
                                                        <DollarSign className="w-3 h-3" /> Paid
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="font-bold text-gray-900 text-lg tracking-tight">₹{booking.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-400 hover:text-primary-600 hover:scale-105 active:scale-95 group">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredBookings.length === 0 && (
                            <div className="text-center py-24">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No bookings found</h3>
                                <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                    {filteredBookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-3xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${booking.journeyModel === 'Property'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'bg-purple-50 text-purple-600'
                                        }`}>
                                        {booking.journeyModel === 'Property' ? <MapPin className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{booking.journeyId?.title || 'Unknown Booking'}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">#{booking._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyles(booking.bookingStatus)}`}>
                                    {booking.bookingStatus}
                                </span>
                            </div>

                            <div className="bg-gray-50/50 rounded-xl p-4 mb-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Customer</span>
                                    <span className="font-medium text-gray-900">{booking.memberId?.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-bold text-gray-900">₹{booking.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Dates</span>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-medium text-gray-700">
                                            {new Date(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-gray-900 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors w-full active:scale-95 duration-200">
                                <Eye className="w-4 h-4" />
                                View Full Details
                            </button>
                        </div>
                    ))}

                    {filteredBookings.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium text-sm">No bookings found.</p>
                        </div>
                    )}
                </div>

                {/* Premium Pagination */}
                <div className="mt-8 flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-100">
                        Page <span className="text-gray-900 font-bold">{page}</span> of {pagination.pages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
