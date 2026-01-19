import mongoose, { Schema, Document } from 'mongoose'

export interface IJourney extends Document {
    title: string
    slug: string
    description: string
    status: 'draft' | 'published' | 'archived'
    location: {
        region: string
        country: string
        coordinates?: {
            lat: number
            lng: number
        }
    }
    duration: {
        days: number
        nights: number
    } | number
    difficulty: 'easy' | 'moderate' | 'challenging'
    idealFor: string[]
    season: string[]
    maxGroupSize: number
    basePrice: number
    margin: number
    includes: string[]
    excludes: string[]
    // New fields for booking system
    price?: number
    destination?: string
    departureDates?: string[]
    itinerary: Array<{
        day: number
        title: string
        description: string
        activities: string[]
        meals: string[]
        accommodation: string
        imageUrl?: string
    }>
    images: string[]
    testimonials: Array<{
        author: string
        rating: number
        text: string
    }>
    createdAt: Date
    updatedAt: Date
}

const JourneySchema = new Schema<IJourney>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true },
        description: { type: String, required: true },
        status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
        location: {
            region: { type: String, required: true },
            country: { type: String, required: true },
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
        duration: {
            type: Schema.Types.Mixed,
            required: true,
        },
        difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], required: true },
        idealFor: [String],
        season: [String],
        maxGroupSize: { type: Number, default: 10 },
        basePrice: { type: Number, required: true },
        margin: { type: Number, default: 15 },
        includes: [String],
        excludes: [String],
        // New fields for booking system
        price: { type: Number },
        destination: { type: String },
        departureDates: [String],
        itinerary: [
            {
                day: Number,
                title: String,
                description: String,
                activities: [String],
                meals: [String],
                accommodation: String,
                imageUrl: String,
            },
        ],
        images: [String],
        testimonials: [
            {
                author: String,
                rating: { type: Number, min: 1, max: 5 },
                text: String,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Transform duration to always return days/nights format
JourneySchema.methods.toJSON = function () {
    const obj = this.toObject()

    // Handle duration field - convert number to {days, nights} format
    if (typeof obj.duration === 'number') {
        obj.duration = {
            days: obj.duration,
            nights: obj.duration - 1
        }
    }

    return obj
}

JourneySchema.index({ slug: 1 }, { unique: true })
JourneySchema.index({ status: 1 })
JourneySchema.index({ 'location.region': 1 })

export default mongoose.model<IJourney>('Journey', JourneySchema)
