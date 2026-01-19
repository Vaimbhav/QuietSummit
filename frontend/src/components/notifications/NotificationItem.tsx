import { Notification } from '../../services/notificationApi';
import { Bell, Calendar, Star, MessageSquare, DollarSign, Home, Info, X } from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    onClick?: (notification: Notification) => void;
}

export default function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) {
    const getIcon = () => {
        switch (notification.type) {
            case 'booking':
                return <Calendar className="w-5 h-5" />;
            case 'review':
                return <Star className="w-5 h-5" />;
            case 'message':
                return <MessageSquare className="w-5 h-5" />;
            case 'payment':
                return <DollarSign className="w-5 h-5" />;
            case 'property':
                return <Home className="w-5 h-5" />;
            case 'system':
                return <Info className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const getIconColor = () => {
        switch (notification.type) {
            case 'booking':
                return 'bg-blue-100 text-blue-600';
            case 'review':
                return 'bg-yellow-100 text-yellow-600';
            case 'message':
                return 'bg-green-100 text-green-600';
            case 'payment':
                return 'bg-purple-100 text-purple-600';
            case 'property':
                return 'bg-indigo-100 text-indigo-600';
            case 'system':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleClick = () => {
        if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead(notification._id);
        }
        onClick?.(notification);
    };

    return (
        <div
            onClick={handleClick}
            className={`flex gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                }`}
        >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColor()}`}>
                {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                    </h4>
                    {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1"></div>
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {notification.message}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                    </span>
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification._id);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Delete notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
