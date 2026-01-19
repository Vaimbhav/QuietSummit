import api from './api';

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    interests?: string[];
    bio?: string;
    profileImage?: string;
    role: 'guest' | 'host' | 'admin';
    isVerified: boolean;
    createdAt: string;
}

export interface UpdateProfileData {
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    interests?: string[];
    bio?: string;
    profileImage?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UpdateEmailData {
    newEmail: string;
    password: string;
}

export interface UserStats {
    totalBookings: number;
    completedBookings: number;
    upcomingBookings: number;
    cancelledBookings: number;
    totalSpent: number;
    reviewsGiven: number;
    reviewsReceived: number;
    averageRating: number;
    wishlistCount: number;
    memberSince: string;
}

export interface BookingItem {
    _id: string;
    propertyId?: {
        _id: string;
        title: string;
        images: Array<{ url: string }>;
        address: { city: string; state: string };
    };
    journeyId?: {
        _id: string;
        title: string;
        images: string[];
        location: string;
    };
    checkIn: string;
    checkOut: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    totalPrice: number;
    guests: number;
    createdAt: string;
}

// Get user profile
export const getMyProfile = async (): Promise<UserProfile> => {
    const response = await api.get('/profile');
    return response.data.data;
};

// Update user profile
export const updateMyProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.put('/profile', data);
    return response.data.data;
};

// Change password
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
    await api.patch('/profile/password', data);
};

// Update email
export const updateEmail = async (data: UpdateEmailData): Promise<void> => {
    await api.patch('/profile/email', data);
};

// Delete account
export const deleteAccount = async (password: string): Promise<void> => {
    await api.delete('/profile', { data: { password } });
};

// Get my bookings
export const getMyBookings = async (params?: {
    type?: 'journey' | 'property';
    status?: string;
    page?: number;
    limit?: number;
}): Promise<{ bookings: BookingItem[]; pagination: any }> => {
    const response = await api.get('/profile/bookings', { params });
    return response.data.data;
};

// Get user statistics
export const getMyStats = async (): Promise<UserStats> => {
    const response = await api.get('/profile/stats');
    return response.data.data;
};
