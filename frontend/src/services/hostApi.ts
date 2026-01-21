import api from './api';

export interface HostProfile {
    _id: string;
    userId: string;
    bio: string;
    languages: string[];
    responseRate: number;
    responseTime: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    propertyCount: number;
    totalBookings: number;
    joinedDate: string;
}

export interface CreatePropertyData {
    title: string;
    description: string;
    propertyType: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    capacity: {
        guests: number;
        bedrooms: number;
        beds: number;
        bathrooms: number;
    };
    amenities: string[];
    images: Array<{ url: string; isPrimary?: boolean }>;
    pricing: {
        basePrice: number;
        weekendPrice?: number;
        monthlyDiscount?: number;
        cleaningFee?: number;
        securityDeposit?: number;
    };
    houseRules: {
        checkIn: string;
        checkOut: string;
        smoking: boolean;
        pets: boolean;
        parties: boolean;
        minNights?: number;
        maxNights?: number;
    };
    cancellationPolicy: string;
    instantBook: boolean;
}

export interface HostStats {
    totalProperties: number;
    activeProperties: number;
    pendingProperties: number;
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    acceptanceRate: number;
}

export interface HostBooking {
    _id: string;
    propertyId: {
        _id: string;
        title: string;
        images: Array<{ url: string }>;
    };
    guestId: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        profileImage?: string;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    status: string;
    totalPrice: number;
    createdAt: string;
}

// Get host profile
export const getHostProfile = async (): Promise<HostProfile> => {
    const response = await api.get('/hosts/profile');
    return response.data.data;
};

// Update host profile
export const updateHostProfile = async (data: Partial<HostProfile>): Promise<HostProfile> => {
    const response = await api.put('/hosts/profile', data);
    return response.data.data;
};

// Get host statistics
export const getHostStats = async (): Promise<HostStats> => {
    const response = await api.get('/hosts/stats');
    return response.data.data;
};

// Get host properties
export const getHostProperties = async (params?: {
    status?: string;
    page?: number;
    limit?: number;
}): Promise<any> => {
    const response = await api.get('/hosts/properties', { params });
    return response.data.data;
};

// Create new property
export const createProperty = async (data: CreatePropertyData): Promise<any> => {
    const response = await api.post('/properties', data);
    return response.data.data;
};

// Update property
export const updateProperty = async (propertyId: string, data: Partial<CreatePropertyData>): Promise<any> => {
    const response = await api.put(`/properties/${propertyId}`, data);
    return response.data.data;
};

// Delete property
export const deleteProperty = async (propertyId: string): Promise<void> => {
    await api.delete(`/properties/${propertyId}`);
};

// Get host bookings
export const getHostBookings = async (params?: {
    status?: string;
    propertyId?: string;
    page?: number;
    limit?: number;
}): Promise<{ bookings: HostBooking[]; pagination: any }> => {
    const response = await api.get('/hosts/bookings', { params });
    return response.data.data;
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: string): Promise<any> => {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data.data;
};

// Get property availability
export const getPropertyAvailability = async (propertyId: string, params?: {
    startDate?: string;
    endDate?: string;
}): Promise<any> => {
    const response = await api.get(`/calendar/${propertyId}`, { params });
    return response.data.data;
};

// Update property availability
export const updatePropertyAvailability = async (propertyId: string, data: {
    date: string;
    available: boolean;
    price?: number;
    minStay?: number;
}): Promise<any> => {
    const response = await api.put(`/calendar/${propertyId}`, data);
    return response.data.data;
};

// Bulk update availability
export const bulkUpdateAvailability = async (propertyId: string, data: {
    startDate: string;
    endDate: string;
    available: boolean;
    price?: number;
    minStay?: number;
}): Promise<any> => {
    const response = await api.post(`/calendar/${propertyId}/bulk`, data);
    return response.data.data;
};
