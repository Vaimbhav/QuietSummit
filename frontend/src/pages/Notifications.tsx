import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllRead, Notification } from '../services/notificationApi';
import NotificationItem from '../components/notifications/NotificationItem';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import Loader from '../components/common/Loader';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'review' | 'message' | 'payment'>('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: 20
    });

    useEffect(() => {
        loadNotifications();
    }, [filter, page]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 20 };
            if (filter === 'unread') {
                params.isRead = false;
            }

            const data = await getNotifications(params);

            // Client-side type filtering if needed
            let filteredNotifications = data.notifications;
            if (filter !== 'all' && filter !== 'unread') {
                filteredNotifications = data.notifications.filter(n => n.type === filter);
            }

            setNotifications(filteredNotifications);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleDeleteAllRead = async () => {
        if (!confirm('Delete all read notifications?')) return;

        try {
            await deleteAllRead();
            setNotifications(prev => prev.filter(n => !n.isRead));
        } catch (error) {
            console.error('Error deleting read notifications:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        // Navigate based on notification type
        if (notification.data?.bookingId) {
            window.location.href = `/my-bookings`;
        } else if (notification.data?.propertyId) {
            window.location.href = `/homestays/${notification.data.propertyId}`;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                        <p className="text-gray-600">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                            >
                                <Check className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={handleDeleteAllRead}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete read
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filter by:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'unread', 'booking', 'review', 'message', 'payment'].map((filterType) => (
                            <button
                                key={filterType}
                                onClick={() => setFilter(filterType as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === filterType
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filterType}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                        <p className="text-gray-600">
                            {filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {notifications.map(notification => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={handleDelete}
                                onClick={handleNotificationClick}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-600">
                            Page {page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={page === pagination.pages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
