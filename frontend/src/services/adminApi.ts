import api from './api';

// Admin User Management
export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'host' | 'admin';
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
    bookingsCount?: number;
    propertiesCount?: number;
}

export interface UsersResponse {
    users: AdminUser[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

// Admin Property Management
export interface AdminProperty {
    _id: string;
    title: string;
    slug: string;
    hostId: {
        _id: string;
        name: string;
        email: string;
    };
    propertyType: string;
    address: {
        city: string;
        state: string;
        country: string;
    };
    pricing: {
        basePrice: number;
    };
    status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'inactive';
    createdAt: string;
    bookingsCount?: number;
    revenue?: number;
}

export interface PropertiesResponse {
    properties: AdminProperty[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

// Admin Review Management
export interface AdminReview {
    _id: string;
    propertyId: {
        _id: string;
        title: string;
    };
    guestId: {
        _id: string;
        name: string;
    };
    rating: number;
    comment: string;
    reported: boolean;
    reportReason?: string;
    createdAt: string;
}

export interface ReviewsResponse {
    reviews: AdminReview[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

// Admin Booking Management
export interface AdminBooking {
    _id: string;
    bookingStatus: 'confirmed' | 'pending' | 'completed' | 'cancelled';
    paymentStatus: 'paid' | 'pending' | 'refunded';
    totalAmount: number;
    createdAt: string;
    memberId: {
        _id: string;
        name: string;
        email: string;
    };
    journeyId?: {
        _id: string;
        title: string;
    };
    journeyModel?: 'Journey' | 'Property';
    startDate: string;
    endDate: string;
}

export interface BookingsResponse {
    bookings: AdminBooking[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

// Admin Stats
export interface AdminStats {
    users: {
        total: number;
        newToday: number;
        newThisWeek: number;
        newThisMonth: number;
        activeUsers: number;
    };
    properties: {
        total: number;
        pending: number;
        active: number;
        inactive: number;
    };
    bookings: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        todayRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        totalRevenue: number;
    };
    reviews: {
        total: number;
        averageRating: number;
        reported: number;
    };
}

// Get admin dashboard stats
export const getAdminStats = async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    const backendStats = response.data.stats;

    // Transform backend stats to match AdminStats interface
    return {
        users: {
            total: backendStats.users.total,
            newToday: 0, // Backend doesn't provide this yet
            newThisWeek: 0, // Backend doesn't provide this yet
            newThisMonth: 0, // Backend doesn't provide this yet
            activeUsers: backendStats.users.confirmed,
        },
        properties: {
            total: backendStats.properties.total,
            pending: backendStats.properties.pending,
            active: backendStats.properties.approved,
            inactive: backendStats.properties.rejected,
        },
        bookings: {
            total: backendStats.bookings.total,
            pending: 0, // Backend doesn't provide this yet
            confirmed: backendStats.bookings.confirmed,
            completed: backendStats.bookings.completed,
            cancelled: backendStats.bookings.cancelled,
            todayRevenue: 0, // Backend doesn't provide this yet
            weekRevenue: 0, // Backend doesn't provide this yet
            monthRevenue: 0, // Backend doesn't provide this yet
            totalRevenue: backendStats.revenue.total,
        },
        reviews: {
            total: backendStats.reviews.total,
            averageRating: 4.5, // Backend doesn't provide this yet
            reported: backendStats.reviews.reported,
        },
    };
};

// User Management
export const getAdminUsers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
}): Promise<UsersResponse> => {
    const response = await api.get('/admin/users', { params });
    return {
        users: response.data.users,
        pagination: response.data.pagination
    };
};

export const updateUserRole = async (userId: string, role: 'user' | 'host' | 'admin'): Promise<AdminUser> => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data.data;
};

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<AdminUser> => {
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
};

// Property Management
export const getAdminProperties = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}): Promise<PropertiesResponse> => {
    const response = await api.get('/admin/properties', { params });
    const { properties, pagination } = response.data;

    // Map host field to hostId to match interface
    const mappedProperties = properties.map((p: any) => ({
        ...p,
        hostId: p.host
    }));

    return {
        properties: mappedProperties,
        pagination
    };
};

export const updatePropertyStatus = async (propertyId: string, status: 'active' | 'pending' | 'inactive', reason?: string): Promise<AdminProperty> => {
    if (status === 'active') {
        const response = await api.patch(`/admin/properties/${propertyId}/approve`);
        return response.data.property;
    } else if (status === 'inactive') {
        const response = await api.patch(`/admin/properties/${propertyId}/reject`, { reason });
        return response.data.property;
    } else {
        // Fallback or error for unsupported status changes via this API
        throw new Error('Unsupported status change');
    }
};

export const deleteProperty = async (propertyId: string): Promise<void> => {
    await api.delete(`/admin/properties/${propertyId}`);
};

// Review Management
export const getAdminReviews = async (params?: {
    page?: number;
    limit?: number;
    reported?: boolean;
}): Promise<ReviewsResponse> => {
    const response = await api.get('/admin/reviews', { params });
    return response.data.data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
    await api.delete(`/admin/reviews/${reviewId}`);
};

export const resolveReportedReview = async (reviewId: string, action: 'keep' | 'delete'): Promise<void> => {
    await api.patch(`/admin/reviews/${reviewId}/resolve`, { action });
};

// Booking Management
export const getAllBookings = async (params?: {
    page?: number;
    limit?: number;
    bookingStatus?: string;
    paymentStatus?: string;
}): Promise<BookingsResponse> => {
    const response = await api.get('/admin/bookings', { params });
    return {
        bookings: response.data.bookings,
        pagination: response.data.pagination
    };
};
