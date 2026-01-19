import api from './api';

export interface Review {
    _id: string;
    propertyId?: string;
    hostId?: string;
    guestId: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    bookingId: string;
    rating: number;
    comment: string;
    aspects: {
        cleanliness?: number;
        communication?: number;
        checkIn?: number;
        accuracy?: number;
        location?: number;
        value?: number;
    };
    hostReply?: {
        comment: string;
        createdAt: string;
    };
    isReported: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewData {
    propertyId?: string;
    hostId?: string;
    bookingId: string;
    rating: number;
    comment: string;
    aspects?: {
        cleanliness?: number;
        communication?: number;
        checkIn?: number;
        accuracy?: number;
        location?: number;
        value?: number;
    };
}

export interface ReviewsResponse {
    reviews: Review[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

// Create a review
export const createReview = async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post('/reviews', data);
    return response.data.review;
};

// Get property reviews
export const getPropertyReviews = async (
    propertyId: string,
    params?: { page?: number; limit?: number; sort?: string }
): Promise<ReviewsResponse> => {
    const response = await api.get(`/reviews/property/${propertyId}`, { params });
    return response.data;
};

// Get host reviews
export const getHostReviews = async (
    hostId: string,
    params?: { page?: number; limit?: number }
): Promise<ReviewsResponse> => {
    const response = await api.get(`/reviews/host/${hostId}`, { params });
    return response.data;
};

// Get my reviews (reviews I've written)
export const getMyReviews = async (
    params?: { page?: number; limit?: number }
): Promise<ReviewsResponse> => {
    const response = await api.get('/reviews/my-reviews', { params });
    return response.data;
};

// Reply to a review (host only)
export const replyToReview = async (reviewId: string, comment: string): Promise<Review> => {
    const response = await api.patch(`/reviews/${reviewId}/reply`, { comment });
    return response.data.review;
};

// Report a review
export const reportReview = async (reviewId: string, reason: string): Promise<void> => {
    await api.post(`/reviews/${reviewId}/report`, { reason });
};
