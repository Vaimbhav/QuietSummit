import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, Notification } from '../../services/notificationApi';
import NotificationItem from './NotificationItem';
import { Bell, Check, X } from 'lucide-react';
import Loader from '../common/Loader';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    unreadCount: number;
    onUnreadCountChange: (count: number) => void;
}

export default function NotificationCenter({ isOpen, onClose, unreadCount, onUnreadCountChange }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, filter]);

    // Remove click outside handler since parent handles hover
    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    //             onClose();
    //         }
    //     };

    //     if (isOpen) {
    //         document.addEventListener('mousedown', handleClickOutside);
    //     }

    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, [isOpen, onClose]);

    // Prevent body scroll when notification center is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const params = filter === 'unread' ? { isRead: false, limit: 20 } : { limit: 20 };
            const data = await getNotifications(params);
            setNotifications(data.notifications);
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
            onUnreadCountChange(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            onUnreadCountChange(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await deleteNotification(notificationId);
            const notification = notifications.find(n => n._id === notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            if (notification && !notification.isRead) {
                onUnreadCountChange(Math.max(0, unreadCount - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        // Navigate based on notification type
        if (notification.data?.bookingId) {
            window.location.href = `/my-bookings`;
        } else if (notification.data?.propertyId) {
            window.location.href = `/homestays/${notification.data.propertyId}`;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close notifications"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${filter === 'all'
                                ? 'bg-primary-100 text-primary-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${filter === 'unread'
                                ? 'bg-primary-100 text-primary-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Unread
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                            <Check className="w-3 h-3" />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div>
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
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200">
                <Link
                    to="/notifications"
                    onClick={onClose}
                    className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                    View All Notifications
                </Link>
            </div>
        </div>
    );
}
