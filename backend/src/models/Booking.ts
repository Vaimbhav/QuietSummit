import mongoose, { Schema, Document } from 'mongoose'

export interface ITraveler {
    name: string
    age: number
    gender: 'male' | 'female' | 'other'
    emergencyContact?: string
}

export interface IPaymentDetails {
    razorpayOrderId: string
    razorpayPaymentId: string
    amount: number
    currency: string
    paidAt?: Date
}

export interface ICouponDetails {
    couponId: mongoose.Types.ObjectId
    code: string
    discount: number
}

export interface IBooking extends Document {
    memberId: mongoose.Types.ObjectId
    user?: mongoose.Types.ObjectId // For backward compatibility/manual entries
    hostId?: mongoose.Types.ObjectId // Direct reference to host
    memberEmail: string
    memberName: string
    journeyId?: mongoose.Types.ObjectId
    journeyModel?: 'Journey' | 'Property'
    journeyTitle: string
    destination: string
    startDate: Date
    endDate: Date
    checkIn?: Date
    checkOut?: Date
    duration: number
    numberOfTravelers: number
    travelers: ITraveler[]
    roomPreference: 'single' | 'double' | 'triple'
    addOns: string[]
    totalAmount: number
    subtotal: number
    discount?: number
    couponDetails?: ICouponDetails
    bookingStatus: 'confirmed' | 'pending' | 'completed' | 'cancelled'
    paymentStatus: 'paid' | 'pending' | 'refunded'
    paymentDetails?: IPaymentDetails
    specialRequests?: string
    createdAt: Date
    updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
    {
        memberId: { type: Schema.Types.ObjectId, ref: 'SignUp', required: true },
        memberEmail: { type: String, required: true },
        memberName: { type: String, required: true },
        journeyId: { type: Schema.Types.ObjectId, refPath: 'journeyModel' },
        journeyModel: {
            type: String,
            required: true,
            enum: ['Journey', 'Property'],
            default: 'Journey'
        },
        journeyTitle: { type: String, required: true },
        destination: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        checkIn: { type: Date },
        checkOut: { type: Date },
        duration: { type: Number, required: true },
        numberOfTravelers: { type: Number, required: true, default: 1 },
        travelers: [{
            name: { type: String, required: true },
            age: { type: Number, required: true },
            gender: { type: String, enum: ['male', 'female', 'other'], required: true },
            emergencyContact: { type: String },
        }],
        roomPreference: {
            type: String,
            enum: ['single', 'double', 'triple'],
            default: 'double',
        },
        addOns: [{ type: String }],
        totalAmount: { type: Number, required: true },
        subtotal: { type: Number },
        discount: { type: Number, default: 0 },
        couponDetails: {
            couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
            code: { type: String },
            discount: { type: Number },
        },
        bookingStatus: {
            type: String,
            enum: ['confirmed', 'pending', 'completed', 'cancelled'],
            default: 'confirmed',
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'pending', 'refunded'],
            default: 'paid',
        },
        paymentDetails: {
            razorpayOrderId: { type: String },
            razorpayPaymentId: { type: String },
            amount: { type: Number },
            currency: { type: String, default: 'INR' },
            paidAt: { type: Date },
        },
        specialRequests: { type: String },
    },
    {
        timestamps: true,
    }
)

BookingSchema.index({ memberId: 1, startDate: -1 })
BookingSchema.index({ memberEmail: 1 })
BookingSchema.index({ bookingStatus: 1 })

export default mongoose.model<IBooking>('Booking', BookingSchema)
