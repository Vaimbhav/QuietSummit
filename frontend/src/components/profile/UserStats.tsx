import { useState, useEffect } from 'react';
import { getMyStats, UserStats as UserStatsType } from '../../services/profileApi';
import { TrendingUp, Calendar, Star, Heart, DollarSign, MessageSquare } from 'lucide-react';
import Loader from '../common/Loader';

export default function UserStats() {
    const [stats, setStats] = useState<UserStatsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyStats();
            setStats(data);
        } catch (error: any) {
            console.error('Error loading stats:', error);
            setError(error.response?.data?.message || 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 flex justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-red-600">{error || 'Failed to load statistics'}</p>
            </div>
        );
    }

    const statCards = [
        {
            icon: Calendar,
            label: 'Total Bookings',
            value: stats.totalBookings,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: TrendingUp,
            label: 'Completed',
            value: stats.completedBookings,
            color: 'bg-green-100 text-green-600'
        },
        {
            icon: Calendar,
            label: 'Upcoming',
            value: stats.upcomingBookings,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            icon: DollarSign,
            label: 'Total Spent',
            value: `$${stats.totalSpent.toLocaleString()}`,
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            icon: Star,
            label: 'Average Rating',
            value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
            color: 'bg-orange-100 text-orange-600'
        },
        {
            icon: MessageSquare,
            label: 'Reviews Given',
            value: stats.reviewsGiven,
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            icon: Heart,
            label: 'Wishlists',
            value: stats.wishlistCount,
            color: 'bg-pink-100 text-pink-600'
        },
        {
            icon: Calendar,
            label: 'Member Since',
            value: new Date(stats.memberSince).getFullYear(),
            color: 'bg-gray-100 text-gray-600'
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Statistics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {stats.cancelledBookings > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                        <span className="font-semibold">{stats.cancelledBookings}</span> cancelled booking{stats.cancelledBookings > 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
}
