import api from './api';

export interface Notification {
    _id: string;
    userId: string;
    type: 'booking' | 'review' | 'message' | 'payment' | 'property' | 'system';
    title: string;
    message: string;
    data?: {
        bookingId?: string;
        propertyId?: string;
        reviewId?: string;
        messageId?: string;
        [key: string]: any;
    };
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

export interface UnreadCountResponse {
    count: number;
}

// Get user notifications
export const getNotifications = async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
}): Promise<NotificationsResponse> => {
    const response = await api.get('/notifications', { params });
    return response.data; // Backend returns data directly, not nested in data.data
};

// Get unread notification count
export const getUnreadCount = async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.unreadCount || 0;
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data;
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
    await api.patch('/notifications/read-all');
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
};

// Delete all read notifications
export const deleteAllRead = async (): Promise<void> => {
    await api.delete('/notifications/read');
};
