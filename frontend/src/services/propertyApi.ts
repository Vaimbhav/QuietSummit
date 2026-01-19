import api from './api';

export interface Property {
    _id: string;
    host: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
        hostProfile?: {
            bio: string;
            languages: string[];
            responseRate?: number;
            responseTime?: string;
        };
    };
    title: string;
    slug: string;
    description: string;
    propertyType: 'house' | 'apartment' | 'villa' | 'cottage' | 'cabin' | 'other';
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    pricing: {
        basePrice: number;
        currency: string;
        weeklyDiscount?: number;
        monthlyDiscount?: number;
        cleaningFee?: number;
        securityDeposit?: number;
    };
    capacity: {
        guests: number;
        bedrooms: number;
        beds: number;
        bathrooms: number;
    };
    amenities: string[];
    houseRules: {
        checkIn: string;
        checkOut: string;
        smoking: boolean;
        pets: boolean;
        parties: boolean;
        quietHours?: string;
        additionalRules?: string[];
    };
    images: Array<{
        url: string;
        caption?: string;
        isPrimary: boolean;
    }>;
    availability: {
        instantBook: boolean;
        minimumStay: number;
        maximumStay?: number;
        advanceNotice: number;
        preparationTime: number;
    };
    status: string;
    reviews: {
        averageRating: number;
        totalReviews: number;
        cleanliness: number;
        communication: number;
        checkIn: number;
        accuracy: number;
        location: number;
        value: number;
    };
    favoriteCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PropertySearchParams {
    page?: number;
    limit?: number;
    city?: string;
    state?: string;
    country?: string;
    search?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    pets?: boolean;
    smoking?: boolean;
    instantBook?: boolean;
    minRating?: number;
    sortBy?: 'price' | 'rating' | 'reviews' | 'newest' | 'popular';
    sortOrder?: 'asc' | 'desc';
    checkIn?: string;
    checkOut?: string;
}

export const searchProperties = async (params: PropertySearchParams) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                queryParams.append(key, value.join(','));
            } else {
                queryParams.append(key, value.toString());
            }
        }
    });

    const response = await api.get(`/properties?${queryParams.toString()}`);
    return response.data;
};

export const getPropertyBySlug = async (slug: string): Promise<Property> => {
    const response = await api.get(`/properties/${slug}`);
    return response.data.data; // Backend returns { success: true, data: property }
};

export const getFeaturedProperties = async (limit = 10) => {
    const response = await api.get(`/search/featured?limit=${limit}`);
    return response.data;
};

export const getFilterOptions = async () => {
    const response = await api.get('/search/filters');
    return response.data.filterOptions;
};

export const getLocationSuggestions = async (query: string) => {
    if (!query || query.length < 2) return { suggestions: [] };
    const response = await api.get(`/search/locations?query=${encodeURIComponent(query)}`);
    return response.data;
};

export const checkAvailability = async (propertyId: string, checkIn: string, checkOut: string) => {
    const response = await api.get(
        `/calendar/${propertyId}/availability?startDate=${checkIn}&endDate=${checkOut}`
    );
    return response.data;
};

export default {
    searchProperties,
    getPropertyBySlug,
    getFeaturedProperties,
    getFilterOptions,
    getLocationSuggestions,
    checkAvailability,
};
