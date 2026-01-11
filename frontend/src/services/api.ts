import axios from 'axios';
import { Journey } from '../types/journey';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 15000, // 15 seconds timeout for mobile networks
});

// Request interceptor: Attach JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const userDataStr = localStorage.getItem('quietsummit_user');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                if (userData.token) {
                    config.headers.Authorization = `Bearer ${userData.token}`;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.response?.data?.expired) {
            // Token expired - clear auth and redirect to login
            localStorage.removeItem('quietsummit_user');

            // Dispatch custom event for auth state change
            window.dispatchEvent(new CustomEvent('auth:expired'));

            // Store current path for redirect after login
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== '/signup' && currentPath !== '/') {
                localStorage.setItem('redirectAfterLogin', currentPath);
            }
        }
        return Promise.reject(error);
    }
);

// Journey APIs
export const getJourneys = async (filters?: {
    difficulty?: string;
    region?: string;
    status?: string;
}): Promise<Journey[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.region) params.append('region', filters.region);
        if (filters?.status) params.append('status', filters.status);

        const url = `/journeys${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data.data; // Backend returns { success, count, data }
    } catch (error) {
        console.error('Error fetching journeys:', error);
        throw error;
    }
};

export const getJourneyBySlug = async (slug: string): Promise<Journey> => {
    try {
        const response = await api.get(`/journeys/${slug}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching journey by slug:', error);
        throw error;
    }
}

// Contact Form API
export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export const submitContactForm = async (data: ContactFormData): Promise<any> => {
    try {
        const response = await api.post('/contact', data);
        return response.data;
    } catch (error) {
        console.error('Error submitting contact form:', error);
        throw error;
    }
};

// Sign Up API
export interface SignUpFormData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    interests: string[];
    subscribeToNewsletter?: boolean;
}

export const submitSignUp = async (data: SignUpFormData): Promise<any> => {
    try {
        const response = await api.post('/signup', data);
        return response.data;
    } catch (error) {
        console.error('Error submitting signup:', error);
        throw error;
    }
};

// Update member preferences
export const updateMemberPreferences = async (data: SignUpFormData): Promise<any> => {
    try {
        const response = await api.put('/auth/preferences', data);
        return response.data;
    } catch (error) {
        console.error('Error updating preferences:', error);
        throw error;
    }
};

// Auth APIs
export interface LoginData {
    email: string;
    password: string;
}

export const loginMember = async (email: string, password: string): Promise<any> => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const refreshToken = async (refreshTokenValue: string): Promise<any> => {
    try {
        const response = await api.post('/auth/refresh', { refreshToken: refreshTokenValue });
        return response.data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};

export const checkMember = async (email: string): Promise<any> => {
    try {
        const response = await api.get(`/auth/check?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        console.error('Error checking member:', error);
        throw error;
    }
};

export const getMemberProfile = async (email: string): Promise<any> => {
    try {
        const response = await api.get(`/auth/profile?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

// Google OAuth
export const getGoogleAuthUrl = (): string => {
    return `${API_URL}/auth/google`;
};

// Booking APIs
export interface BookingFormData {
    email: string;
    journeyId: string;
    departureDate: string;
    numberOfTravelers: number;
    travelers: Array<{
        name: string;
        age: number;
        gender: 'male' | 'female' | 'other';
        emergencyContact?: string;
    }>;
    roomPreference: 'single' | 'double' | 'triple';
    addOns: string[];
    specialRequests: string;
    totalAmount: number;
    paymentId?: string;
    orderId?: string;
}

export const createBooking = async (data: Partial<BookingFormData>): Promise<any> => {
    try {
        const response = await api.post('/bookings', data);
        return response.data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

export const getBookingById = async (id: string): Promise<any> => {
    try {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
    }
};

export const getMemberBookings = async (email: string): Promise<any> => {
    try {
        const response = await api.get(`/bookings/member/all?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

export const calculatePrice = async (data: {
    journeyId: string;
    numberOfTravelers: number;
    addOns?: string[];
}): Promise<any> => {
    try {
        const response = await api.post('/bookings/calculate-price', data);
        return response.data;
    } catch (error) {
        console.error('Error calculating price:', error);
        throw error;
    }
};

// Payment APIs
export const createRazorpayOrder = async (data: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: any;
}): Promise<any> => {
    try {
        const response = await api.post('/payments/create-order', data);
        return response.data;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
};

export const verifyPayment = async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): Promise<any> => {
    try {
        const response = await api.post('/payments/verify', data);
        return response.data;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
};

export const getRazorpayKey = async (): Promise<any> => {
    try {
        const response = await api.get('/payments/key');
        return response.data;
    } catch (error) {
        console.error('Error fetching Razorpay key:', error);
        throw error;
    }
};

// Coupon APIs
export const getActiveCoupons = async (): Promise<any> => {
    try {
        const response = await api.get('/coupons/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active coupons:', error);
        throw error;
    }
};

export const validateCoupon = async (data: {
    code: string;
    journeyId: string;
    subtotal: number;
}): Promise<any> => {
    try {
        const response = await api.post('/coupons/validate', data);
        return response.data;
    } catch (error) {
        console.error('Error validating coupon:', error);
        throw error;
    }
};

export default api;
