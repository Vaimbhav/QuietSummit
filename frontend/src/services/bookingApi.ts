import api from './api';

export interface PropertyBookingData {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
}

export interface BookingResponse {
    success: boolean;
    message: string;
    data: {
        booking: {
            _id: string;
            bookingId: string;
            memberEmail: string;
            propertyId: string;
            checkIn: string;
            checkOut: string;
            guests: number;
            totalAmount: number;
            bookingStatus: string;
            createdAt: string;
        };
    };
}

export const createPropertyBooking = async (data: PropertyBookingData): Promise<BookingResponse> => {
    // Get user email from localStorage
    const userDataStr = localStorage.getItem('quietsummit_user');
    let userEmail = '';
    let userName = 'Guest';

    if (userDataStr) {
        try {
            const userData = JSON.parse(userDataStr);
            userEmail = userData.user?.email || userData.email || '';
            userName = userData.user?.name || userData.name || 'Guest';
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }

    // Calculate total amount
    const priceData = await calculateBookingPrice(data);

    // Create travelers array with guest info
    const travelers = Array.from({ length: data.guests }, (_, index) => ({
        name: index === 0 ? userName : `Guest ${index + 1}`,
        age: 30, // Default age
        gender: 'other' as const,
        emergencyContact: '', // Add empty emergency contact to match backend model
    }));

    const response = await api.post('/bookings', {
        email: userEmail,
        journeyId: data.propertyId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        numberOfTravelers: data.guests,
        travelers: travelers,
        roomPreference: 'double', // Default room preference for properties
        totalAmount: priceData.totalPrice,
        journeyModel: 'Property',
    });

    // Backend returns { success: true, data: booking }
    // We need to wrap it to match our interface
    return {
        success: response.data.success,
        message: 'Booking created successfully',
        data: {
            booking: response.data.data
        }
    };
};

export const calculateBookingPrice = async (data: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
}): Promise<{ basePrice: number; cleaningFee: number; totalPrice: number; nights: number }> => {
    // Calculate nights
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Fetch property details to get pricing
    const propertyResponse = await api.get(`/properties/${data.propertyId}`);
    const property = propertyResponse.data.data;

    const basePrice = property.pricing.basePrice * nights;
    const cleaningFee = property.pricing.cleaningFee || 0;
    const totalPrice = basePrice + cleaningFee;

    return {
        basePrice,
        cleaningFee,
        totalPrice,
        nights,
    };
};
