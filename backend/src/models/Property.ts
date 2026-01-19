import { Schema, model, Document, Types } from 'mongoose'

export interface IProperty extends Document {
    host: Types.ObjectId
    title: string
    slug: string
    description: string
    propertyType: 'house' | 'apartment' | 'villa' | 'cottage' | 'cabin' | 'other'
    address: {
        street: string
        city: string
        state: string
        country: string
        postalCode: string
        coordinates: {
            latitude: number
            longitude: number
        }
    }
    pricing: {
        basePrice: number
        currency: string
        weeklyDiscount?: number
        monthlyDiscount?: number
        cleaningFee?: number
        securityDeposit?: number
    }
    capacity: {
        guests: number
        bedrooms: number
        beds: number
        bathrooms: number
    }
    amenities: string[]
    houseRules: {
        checkIn: string
        checkOut: string
        smoking: boolean
        pets: boolean
        parties: boolean
        quietHours?: string
        additionalRules?: string[]
    }
    images: Array<{
        url: string
        caption?: string
        isPrimary: boolean
    }>
    availability: {
        instantBook: boolean
        minimumStay: number
        maximumStay?: number
        advanceNotice: number
        preparationTime: number
    }
    status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'inactive'
    verificationStatus: {
        isVerified: boolean
        verifiedAt?: Date
        verifiedBy?: Types.ObjectId
        rejectionReason?: string
    }
    reviews: {
        averageRating: number
        totalReviews: number
        cleanliness: number
        communication: number
        checkIn: number
        accuracy: number
        location: number
        value: number
    }
    bookings: {
        totalBookings: number
        totalRevenue: number
    }
    favoriteCount: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const propertySchema = new Schema<IProperty>(
    {
        host: {
            type: Schema.Types.ObjectId,
            ref: 'SignUp',
            required: [true, 'Host is required'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Property title is required'],
            trim: true,
            minlength: [10, 'Title must be at least 10 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        slug: {
            type: String,
            unique: true,
            sparse: true, // improved index
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Property description is required'],
            minlength: [50, 'Description must be at least 50 characters'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        propertyType: {
            type: String,
            required: [true, 'Property type is required'],
            enum: {
                values: ['house', 'apartment', 'villa', 'cottage', 'cabin', 'other'],
                message: 'Invalid property type',
            },
        },
        address: {
            street: {
                type: String,
                required: [true, 'Street address is required'],
            },
            city: {
                type: String,
                required: [true, 'City is required'],
                index: true,
            },
            state: {
                type: String,
                required: [true, 'State is required'],
            },
            country: {
                type: String,
                required: [true, 'Country is required'],
                index: true,
            },
            postalCode: {
                type: String,
                required: [true, 'Postal code is required'],
            },
            coordinates: {
                latitude: {
                    type: Number,
                    required: [true, 'Latitude is required'],
                    min: [-90, 'Invalid latitude'],
                    max: [90, 'Invalid latitude'],
                },
                longitude: {
                    type: Number,
                    required: [true, 'Longitude is required'],
                    min: [-180, 'Invalid longitude'],
                    max: [180, 'Invalid longitude'],
                },
            },
        },
        pricing: {
            basePrice: {
                type: Number,
                required: [true, 'Base price is required'],
                min: [1, 'Price must be at least 1'],
            },
            currency: {
                type: String,
                required: true,
                default: 'USD',
                uppercase: true,
            },
            weeklyDiscount: {
                type: Number,
                min: [0, 'Discount cannot be negative'],
                max: [100, 'Discount cannot exceed 100%'],
            },
            monthlyDiscount: {
                type: Number,
                min: [0, 'Discount cannot be negative'],
                max: [100, 'Discount cannot exceed 100%'],
            },
            cleaningFee: {
                type: Number,
                min: [0, 'Cleaning fee cannot be negative'],
                default: 0,
            },
            securityDeposit: {
                type: Number,
                min: [0, 'Security deposit cannot be negative'],
                default: 0,
            },
        },
        capacity: {
            guests: {
                type: Number,
                required: [true, 'Guest capacity is required'],
                min: [1, 'Must accommodate at least 1 guest'],
                max: [50, 'Cannot exceed 50 guests'],
            },
            bedrooms: {
                type: Number,
                required: [true, 'Number of bedrooms is required'],
                min: [0, 'Cannot be negative'],
            },
            beds: {
                type: Number,
                required: [true, 'Number of beds is required'],
                min: [1, 'Must have at least 1 bed'],
            },
            bathrooms: {
                type: Number,
                required: [true, 'Number of bathrooms is required'],
                min: [0.5, 'Must have at least 0.5 bathrooms'],
                max: [20, 'Cannot exceed 20 bathrooms'],
            },
        },
        amenities: {
            type: [String],
            default: [],
            validate: {
                validator: function (v: string[]) {
                    return v.length <= 50
                },
                message: 'Cannot have more than 50 amenities',
            },
        },
        houseRules: {
            checkIn: {
                type: String,
                required: [true, 'Check-in time is required'],
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
            },
            checkOut: {
                type: String,
                required: [true, 'Check-out time is required'],
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
            },
            smoking: {
                type: Boolean,
                default: false,
            },
            pets: {
                type: Boolean,
                default: false,
            },
            parties: {
                type: Boolean,
                default: false,
            },
            quietHours: String,
            additionalRules: [String],
        },
        images: {
            type: [
                {
                    url: {
                        type: String,
                        required: true,
                    },
                    caption: String,
                    isPrimary: {
                        type: Boolean,
                        default: false,
                    },
                },
            ],
            validate: {
                validator: function (v: any[]) {
                    return v.length >= 3 && v.length <= 50
                },
                message: 'Must have between 3 and 50 images',
            },
        },
        availability: {
            instantBook: {
                type: Boolean,
                default: false,
            },
            minimumStay: {
                type: Number,
                default: 1,
                min: [1, 'Minimum stay must be at least 1 night'],
            },
            maximumStay: {
                type: Number,
                min: [1, 'Maximum stay must be at least 1 night'],
            },
            advanceNotice: {
                type: Number,
                default: 0,
                min: [0, 'Cannot be negative'],
                max: [365, 'Cannot exceed 365 days'],
            },
            preparationTime: {
                type: Number,
                default: 1,
                min: [0, 'Cannot be negative'],
                max: [30, 'Cannot exceed 30 days'],
            },
        },
        status: {
            type: String,
            enum: ['draft', 'pending_review', 'approved', 'rejected', 'inactive'],
            default: 'draft',
            index: true,
        },
        verificationStatus: {
            isVerified: {
                type: Boolean,
                default: false,
            },
            verifiedAt: Date,
            verifiedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            rejectionReason: String,
        },
        reviews: {
            averageRating: {
                type: Number,
                default: 0,
                min: [0, 'Rating cannot be negative'],
                max: [5, 'Rating cannot exceed 5'],
            },
            totalReviews: {
                type: Number,
                default: 0,
                min: [0, 'Cannot be negative'],
            },
            cleanliness: { type: Number, default: 0, min: 0, max: 5 },
            communication: { type: Number, default: 0, min: 0, max: 5 },
            checkIn: { type: Number, default: 0, min: 0, max: 5 },
            accuracy: { type: Number, default: 0, min: 0, max: 5 },
            location: { type: Number, default: 0, min: 0, max: 5 },
            value: { type: Number, default: 0, min: 0, max: 5 },
        },
        bookings: {
            totalBookings: {
                type: Number,
                default: 0,
                min: [0, 'Cannot be negative'],
            },
            totalRevenue: {
                type: Number,
                default: 0,
                min: [0, 'Cannot be negative'],
            },
        },
        favoriteCount: {
            type: Number,
            default: 0,
            min: [0, 'Cannot be negative'],
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Indexes for efficient queries
propertySchema.index({ 'address.city': 1, status: 1, isActive: 1 })
propertySchema.index({ 'address.country': 1, status: 1, isActive: 1 })
propertySchema.index({ propertyType: 1, status: 1 })
propertySchema.index({ 'pricing.basePrice': 1 })
propertySchema.index({ 'reviews.averageRating': -1 })
propertySchema.index({ 'address.coordinates.latitude': 1, 'address.coordinates.longitude': 1 })

// Pre-save middleware to generate slug
propertySchema.pre('save', async function () {
    if (this.isNew || this.isModified('title')) {
        const baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

        let slug = baseSlug
        let counter = 1

        while (await this.model('Property').findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`
            counter++
        }

        this.slug = slug
    }
})

// Virtual for primary image
propertySchema.virtual('primaryImage').get(function () {
    const primary = this.images.find((img) => img.isPrimary)
    return primary || this.images[0]
})

export const Property = model<IProperty>('Property', propertySchema)
