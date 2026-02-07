import { Schema, model, Document, Types } from 'mongoose'

export interface IPulse extends Document {
    title: string
    slug: string
    description: string
    shortDescription: string
    perspectiveType: 'Meditative' | 'Physical' | 'Educational' | 'Creative' | 'Spiritual'
    difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme'
    duration: {
        days: number
        nights: number
    }
    location: {
        region: string
        state: string
        country: string
        nearestCity: string
        coordinates?: {
            latitude: number
            longitude: number
        }
    }
    suggestedStays: Types.ObjectId[]
    suggestedGuides: Types.ObjectId[]
    pricing: {
        basePrice: number
        currency: string
        groupDiscount?: number
        includes: string[]
        excludes: string[]
    }
    capacity: {
        min: number
        max: number
    }
    itinerary: Array<{
        day: number
        title: string
        description: string
        activities: string[]
        location: string
        elevation?: number
        distance?: number
        duration?: string
    }>
    whatToBring: string[]
    physicalRequirements: string
    images: string[]
    videos?: string[]
    testimonials: Array<{
        author: string
        rating: number
        text: string
        date: Date
    }>
    season: string[]
    bestMonths: string[]
    availability: {
        isActive: boolean
        upcomingDates: Array<{
            startDate: Date
            endDate: Date
            spotsAvailable: number
            spotsBooked: number
        }>
    }
    highlights: string[]
    tags: string[]
    rating: {
        average: number
        count: number
    }
    status: 'draft' | 'published' | 'archived'
    featured: boolean
    createdAt: Date
    updatedAt: Date
}

const pulseSchema = new Schema<IPulse>(
    {
        title: {
            type: String,
            required: [true, 'Pulse title is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        shortDescription: {
            type: String,
            required: [true, 'Short description is required'],
            maxlength: [300, 'Short description cannot exceed 300 characters'],
        },
        perspectiveType: {
            type: String,
            required: [true, 'Perspective type is required'],
            enum: ['Meditative', 'Physical', 'Educational', 'Creative', 'Spiritual'],
        },
        difficulty: {
            type: String,
            required: [true, 'Difficulty level is required'],
            enum: ['easy', 'moderate', 'challenging', 'extreme'],
        },
        duration: {
            days: {
                type: Number,
                required: true,
                min: 1,
            },
            nights: {
                type: Number,
                required: true,
                min: 0,
            },
        },
        location: {
            region: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                default: 'India',
            },
            nearestCity: {
                type: String,
                required: true,
            },
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        suggestedStays: [{
            type: Schema.Types.ObjectId,
            ref: 'Property',
        }],
        suggestedGuides: [{
            type: Schema.Types.ObjectId,
            ref: 'Guide',
        }],
        pricing: {
            basePrice: {
                type: Number,
                required: true,
                min: 0,
            },
            currency: {
                type: String,
                default: 'INR',
            },
            groupDiscount: {
                type: Number,
                min: 0,
                max: 100,
            },
            includes: [{
                type: String,
            }],
            excludes: [{
                type: String,
            }],
        },
        capacity: {
            min: {
                type: Number,
                required: true,
                min: 1,
            },
            max: {
                type: Number,
                required: true,
                min: 1,
            },
        },
        itinerary: [{
            day: {
                type: Number,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            activities: [{
                type: String,
            }],
            location: {
                type: String,
                required: true,
            },
            elevation: Number,
            distance: Number,
            duration: String,
        }],
        whatToBring: [{
            type: String,
        }],
        physicalRequirements: {
            type: String,
            required: true,
        },
        images: [{
            type: String,
            required: true,
        }],
        videos: [{
            type: String,
        }],
        testimonials: [{
            author: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            text: {
                type: String,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        }],
        season: [{
            type: String,
            enum: ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter'],
        }],
        bestMonths: [{
            type: String,
        }],
        availability: {
            isActive: {
                type: Boolean,
                default: true,
            },
            upcomingDates: [{
                startDate: {
                    type: Date,
                    required: true,
                },
                endDate: {
                    type: Date,
                    required: true,
                },
                spotsAvailable: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                spotsBooked: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
            }],
        },
        highlights: [{
            type: String,
        }],
        tags: [{
            type: String,
        }],
        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            count: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
pulseSchema.index({ slug: 1 })
pulseSchema.index({ perspectiveType: 1 })
pulseSchema.index({ difficulty: 1 })
pulseSchema.index({ 'location.region': 1 })
pulseSchema.index({ 'location.state': 1 })
pulseSchema.index({ status: 1, featured: 1 })
pulseSchema.index({ 'rating.average': -1 })

// Update rating average
pulseSchema.methods.updateRating = function () {
    if (this.testimonials.length === 0) {
        this.rating.average = 0
        this.rating.count = 0
    } else {
        const sum = this.testimonials.reduce((acc: number, testimonial: any) => acc + testimonial.rating, 0)
        this.rating.average = sum / this.testimonials.length
        this.rating.count = this.testimonials.length
    }
}

export default model<IPulse>('Pulse', pulseSchema)
