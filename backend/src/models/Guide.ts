import { Schema, model, Document, Types } from 'mongoose'

export interface IGuide extends Document {
    name: string
    slug: string
    email: string
    phone: string
    bio: string
    storytellingFocus: string
    videoIntroUrl?: string
    profileImage?: string
    experience: {
        years: number
        description: string
    }
    specializations: string[]
    regions: string[]
    languages: string[]
    certifications: Array<{
        name: string
        issuer: string
        year: number
    }>
    availability: {
        isActive: boolean
        availableDates: Date[]
        blackoutDates: Date[]
    }
    pricing: {
        baseDayRate: number
        currency: string
        negotiable: boolean
    }
    rating: {
        average: number
        count: number
    }
    reviews: Array<{
        client: Types.ObjectId
        journey: Types.ObjectId
        rating: number
        comment: string
        date: Date
    }>
    socialMedia: {
        instagram?: string
        facebook?: string
        website?: string
    }
    emergencyContact: {
        name: string
        phone: string
        relationship: string
    }
    status: 'active' | 'inactive' | 'suspended'
    verified: boolean
    createdAt: Date
    updatedAt: Date
}

const guideSchema = new Schema<IGuide>(
    {
        name: {
            type: String,
            required: [true, 'Guide name is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
        },
        bio: {
            type: String,
            required: [true, 'Bio is required'],
            maxlength: [1000, 'Bio cannot exceed 1000 characters'],
        },
        storytellingFocus: {
            type: String,
            required: [true, 'Storytelling focus is required'],
            maxlength: [500, 'Storytelling focus cannot exceed 500 characters'],
        },
        videoIntroUrl: {
            type: String,
            validate: {
                validator: function (v: string) {
                    return !v || v.length <= 500
                },
                message: 'Video intro URL is too long',
            },
        },
        profileImage: {
            type: String,
        },
        experience: {
            years: {
                type: Number,
                required: true,
                min: 0,
            },
            description: {
                type: String,
                required: true,
            },
        },
        specializations: [{
            type: String,
            enum: [
                'Mountain Trekking',
                'Cultural Tours',
                'Wildlife Safaris',
                'Meditation & Yoga',
                'Photography',
                'Birdwatching',
                'Rock Climbing',
                'Local Cuisine',
                'Historical Sites',
                'Spiritual Journeys',
                'Adventure Sports',
                'Nature Walks',
            ],
        }],
        regions: [{
            type: String,
        }],
        languages: [{
            type: String,
            required: true,
        }],
        certifications: [{
            name: {
                type: String,
                required: true,
            },
            issuer: {
                type: String,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            },
        }],
        availability: {
            isActive: {
                type: Boolean,
                default: true,
            },
            availableDates: [{
                type: Date,
            }],
            blackoutDates: [{
                type: Date,
            }],
        },
        pricing: {
            baseDayRate: {
                type: Number,
                required: true,
                min: 0,
            },
            currency: {
                type: String,
                default: 'INR',
            },
            negotiable: {
                type: Boolean,
                default: false,
            },
        },
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
        reviews: [{
            client: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            journey: {
                type: Schema.Types.ObjectId,
                ref: 'Journey',
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
            date: {
                type: Date,
                default: Date.now,
            },
        }],
        socialMedia: {
            instagram: String,
            facebook: String,
            website: String,
        },
        emergencyContact: {
            name: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            relationship: {
                type: String,
                required: true,
            },
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active',
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
guideSchema.index({ slug: 1 })
guideSchema.index({ regions: 1 })
guideSchema.index({ specializations: 1 })
guideSchema.index({ 'rating.average': -1 })
guideSchema.index({ status: 1, verified: 1 })

// Update rating average when reviews change
guideSchema.methods.updateRating = function () {
    if (this.reviews.length === 0) {
        this.rating.average = 0
        this.rating.count = 0
    } else {
        const sum = this.reviews.reduce((acc: number, review: any) => acc + review.rating, 0)
        this.rating.average = sum / this.reviews.length
        this.rating.count = this.reviews.length
    }
}

export default model<IGuide>('Guide', guideSchema)
