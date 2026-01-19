import { z } from 'zod'

// Traveler schema
const travelerSchema = z.object({
    name: z.string().min(1, 'Traveler name is required'),
    age: z.number().int().positive('Age must be a positive number').max(120, 'Invalid age'),
    gender: z.enum(['male', 'female', 'other'], { message: 'Gender is required' }),
    emergencyContact: z.string().optional(),
})

// Booking creation schema
export const createBookingSchema = z.object({
    email: z.string().email('Invalid email address'),
    journeyId: z.string().min(1, 'Journey ID is required'),
    departureDate: z.string().optional(), // Optional for Property bookings
    checkIn: z.string().optional(), // For Property bookings
    checkOut: z.string().optional(), // For Property bookings
    numberOfTravelers: z.number().int().positive('Number of travelers must be at least 1').max(20, 'Maximum 20 travelers allowed'),
    travelers: z.array(travelerSchema).min(1, 'At least one traveler is required'),
    roomPreference: z.enum(['single', 'double', 'triple'], { message: 'Room preference is required' }),
    addOns: z.array(z.string()).optional().default([]),
    specialRequests: z.string().optional().default(''),
    totalAmount: z.number().positive('Total amount must be greater than 0'),
    paymentId: z.string().optional(),
    orderId: z.string().optional(),
    // Razorpay payment verification fields
    razorpay_payment_id: z.string().optional(),
    razorpay_order_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
    discount: z.number().optional(),
    couponDetails: z.object({
        couponId: z.string(),
        code: z.string(),
        discount: z.number(),
    }).optional(),
    journeyModel: z.enum(['Journey', 'Property']).optional(), // To differentiate booking types
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

// Booking update schema (partial)
export const updateBookingSchema = z.object({
    bookingStatus: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
    specialRequests: z.string().optional(),
})

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>

// Payment order creation schema
export const createPaymentOrderSchema = z.object({
    amount: z.number().positive('Amount must be greater than 0').max(10000000, 'Amount exceeds maximum allowed'),
    currency: z.string().length(3, 'Currency must be 3 characters').default('INR'),
    receipt: z.string().min(1, 'Receipt ID is required'),
    notes: z.record(z.string(), z.string()).optional(),
})

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>

// Payment verification schema
export const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1, 'Order ID is required'),
    razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
    razorpay_signature: z.string().min(1, 'Signature is required'),
})

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>

// Price calculation schema
export const calculatePriceSchema = z.object({
    journeyId: z.string().min(1, 'Journey ID is required'),
    numberOfTravelers: z.number().int().positive('Number of travelers must be at least 1').max(20, 'Maximum 20 travelers allowed'),
    addOns: z.array(z.string()).optional().default([]),
})

export type CalculatePriceInput = z.infer<typeof calculatePriceSchema>

// Coupon validation schema
export const validateCouponSchema = z.object({
    code: z.string().min(1, 'Coupon code is required'),
    journeyId: z.string().min(1, 'Journey ID is required'),
    subtotal: z.number().positive('Subtotal must be greater than 0'),
})

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>

// Contact form schema
export const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long'),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

// Sign up schema
export const signUpSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
    interests: z.array(z.string()).optional().default([]),
    subscribeToNewsletter: z.boolean().optional().default(true),
})

export type SignUpInput = z.infer<typeof signUpSchema>
