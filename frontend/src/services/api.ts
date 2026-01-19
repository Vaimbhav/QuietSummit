import axios from 'axios';
import { Journey } from '../types/journey';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const IS_DEV = import.meta.env.DEV;

// Simple logger that only logs in development
const logger = {
    error: (...args: any[]) => {
        if (IS_DEV) {
            console.error(...args);
        }
    },
    warn: (...args: any[]) => {
        if (IS_DEV) {
            console.warn(...args);
        }
    },
    info: (...args: any[]) => {
        if (IS_DEV) {
            console.info(...args);
        }
    }
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
});

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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
                logger.error('Error parsing user data:', error);
                // Clear corrupted data
                localStorage.removeItem('quietsummit_user');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle token expiration with refresh and retry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Wait for the refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const userDataStr = localStorage.getItem('quietsummit_user');
                if (!userDataStr) {
                    throw new Error('No user data');
                }

                const userData = JSON.parse(userDataStr);
                if (!userData.refreshToken) {
                    throw new Error('No refresh token');
                }

                // Attempt to refresh token
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken: userData.refreshToken,
                });

                const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

                // Update stored tokens
                userData.token = newToken;
                userData.refreshToken = newRefreshToken;
                localStorage.setItem('quietsummit_user', JSON.stringify(userData));

                // Update auth header for this request
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Process queued requests with new token
                processQueue(null, newToken);

                isRefreshing = false;

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear auth and redirect
                processQueue(refreshError, null);
                isRefreshing = false;

                localStorage.removeItem('quietsummit_user');
                window.dispatchEvent(new CustomEvent('auth:expired'));

                const currentPath = window.location.pathname + window.location.search;
                if (currentPath !== '/signup' && currentPath !== '/') {
                    localStorage.setItem('redirectAfterLogin', currentPath);
                }

                return Promise.reject(refreshError);
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
        logger.error('Error fetching journeys:', error);
        throw error;
    }
};

export const getJourneyBySlug = async (slug: string): Promise<Journey> => {
    try {
        const response = await api.get(`/journeys/${slug}`);
        return response.data.data;
    } catch (error) {
        logger.error('Error fetching journey by slug:', error);
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
        logger.error('Error submitting contact form:', error);
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
        logger.error('Error submitting signup:', error);
        throw error;
    }
};

// Update member preferences
export const updateMemberPreferences = async (data: SignUpFormData): Promise<any> => {
    try {
        const response = await api.put('/auth/preferences', data);
        return response.data;
    } catch (error) {
        logger.error('Error updating preferences:', error);
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
        logger.error('Error logging in:', error);
        throw error;
    }
};

export const refreshToken = async (refreshTokenValue: string): Promise<any> => {
    try {
        const response = await api.post('/auth/refresh', { refreshToken: refreshTokenValue });
        return response.data;
    } catch (error) {
        logger.error('Error refreshing token:', error);
        throw error;
    }
};

export const checkMember = async (email: string): Promise<any> => {
    try {
        const response = await api.get(`/auth/check?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        logger.error('Error checking member:', error);
        throw error;
    }
};

export const getMemberProfile = async (email: string): Promise<any> => {
    try {
        const response = await api.get(`/auth/profile?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        logger.error('Error fetching profile:', error);
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
    // Razorpay payment verification fields
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    discount?: number;
    couponDetails?: {
        couponId: string;
        code: string;
        discount: number;
    };
}

export const createBooking = async (data: Partial<BookingFormData>): Promise<any> => {
    try {
        logger.info('Creating booking with data:', {
            ...data,
            razorpay_signature: data.razorpay_signature ? data.razorpay_signature.substring(0, 10) + '...' : 'MISSING',
            razorpay_payment_id: data.razorpay_payment_id || 'MISSING',
            razorpay_order_id: data.razorpay_order_id || 'MISSING'
        });
        logger.info('Full payment fields:', {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature?.substring(0, 20) + '...',
            paymentId: data.paymentId,
            orderId: data.orderId
        });
        const response = await api.post('/bookings', data);
        logger.info('Booking response:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Error creating booking:', error);
        throw error;
    }
};

export const getBookingById = async (id: string): Promise<any> => {
    try {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    } catch (error) {
        logger.error('Error fetching booking:', error);
        throw error;
    }
};

export const getMemberBookings = async (email: string): Promise<any> => {
    try {
        const response = await api.get(`/bookings/member/all?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        logger.error('Error fetching bookings:', error);
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
        logger.error('Error calculating price:', error);
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
        logger.error('Error creating Razorpay order:', error);
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
        logger.error('Error verifying payment:', error);
        throw error;
    }
};

export const getRazorpayKey = async (): Promise<any> => {
    try {
        const response = await api.get('/payments/key');
        return response.data;
    } catch (error) {
        logger.error('Error fetching Razorpay key:', error);
        throw error;
    }
};

// Coupon APIs
export const getActiveCoupons = async (): Promise<any> => {
    try {
        const response = await api.get('/coupons/active');
        return response.data;
    } catch (error) {
        logger.error('Error fetching active coupons:', error);
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
        logger.error('Error validating coupon:', error);
        throw error;
    }
};

export default api;
