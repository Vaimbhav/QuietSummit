import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId
    type: 'booking' | 'review' | 'message' | 'payment' | 'property' | 'system'
    title: string
    message: string
    data?: {
        bookingId?: mongoose.Types.ObjectId
        propertyId?: mongoose.Types.ObjectId
        reviewId?: mongoose.Types.ObjectId
        messageId?: mongoose.Types.ObjectId
        [key: string]: any
    }
    isRead: boolean
    readAt?: Date
    createdAt: Date
    updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'SignUp',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['booking', 'review', 'message', 'payment', 'property', 'system'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 100,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        data: {
            type: Schema.Types.Mixed,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ userId: 1, isRead: 1 })
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }) // Auto-delete after 30 days

export default mongoose.model<INotification>('Notification', NotificationSchema)
