import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
    propertyId?: mongoose.Types.ObjectId
    hostId?: mongoose.Types.ObjectId
    guestId: mongoose.Types.ObjectId
    guestName: string
    bookingId: mongoose.Types.ObjectId
    rating: number
    comment: string
    reviewType: 'property' | 'host'
    aspects?: {
        cleanliness?: number
        communication?: number
        checkIn?: number
        accuracy?: number
        location?: number
        value?: number
    }
    hostReply?: {
        comment: string
        repliedAt: Date
    }
    isReported: boolean
    reportReason?: string
    reportedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
    {
        propertyId: {
            type: Schema.Types.ObjectId,
            ref: 'Property',
            required: function (this: IReview) {
                return this.reviewType === 'property'
            },
        },
        hostId: {
            type: Schema.Types.ObjectId,
            ref: 'SignUp',
            required: function (this: IReview) {
                return this.reviewType === 'host'
            },
        },
        guestId: {
            type: Schema.Types.ObjectId,
            ref: 'SignUp',
            required: true,
        },
        guestName: {
            type: String,
            required: true,
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            unique: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        reviewType: {
            type: String,
            enum: ['property', 'host'],
            required: true,
        },
        aspects: {
            cleanliness: { type: Number, min: 1, max: 5 },
            communication: { type: Number, min: 1, max: 5 },
            checkIn: { type: Number, min: 1, max: 5 },
            accuracy: { type: Number, min: 1, max: 5 },
            location: { type: Number, min: 1, max: 5 },
            value: { type: Number, min: 1, max: 5 },
        },
        hostReply: {
            comment: { type: String, maxlength: 500 },
            repliedAt: { type: Date },
        },
        isReported: {
            type: Boolean,
            default: false,
        },
        reportReason: {
            type: String,
        },
        reportedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes for efficient queries
ReviewSchema.index({ propertyId: 1, createdAt: -1 })
ReviewSchema.index({ hostId: 1, createdAt: -1 })
ReviewSchema.index({ guestId: 1 })
ReviewSchema.index({ reviewType: 1 })

export default mongoose.model<IReview>('Review', ReviewSchema)
