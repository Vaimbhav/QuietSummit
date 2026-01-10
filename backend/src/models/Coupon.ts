import mongoose from 'mongoose'

export interface ICoupon extends mongoose.Document {
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    minPurchase?: number
    maxDiscount?: number
    validFrom: Date
    validUntil: Date
    usageLimit?: number
    usedCount: number
    isActive: boolean
    applicableJourneys: mongoose.Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
}

const couponSchema = new mongoose.Schema<ICoupon>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minPurchase: {
            type: Number,
            min: 0,
        },
        maxDiscount: {
            type: Number,
            min: 0,
        },
        validFrom: {
            type: Date,
            required: true,
        },
        validUntil: {
            type: Date,
            required: true,
        },
        usageLimit: {
            type: Number,
            min: 0,
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        applicableJourneys: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Journey',
        }],
    },
    {
        timestamps: true,
    }
)

// Index for faster coupon lookups
couponSchema.index({ code: 1, isActive: 1 })
couponSchema.index({ validFrom: 1, validUntil: 1 })

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema)
