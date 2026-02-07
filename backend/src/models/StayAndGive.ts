import { Schema, model, Document, Types } from 'mongoose'

export interface IStayAndGive extends Document {
    applicant: Types.ObjectId
    property: Types.ObjectId
    application: {
        motivationLetter: string
        skills: string[]
        projectProposal: string
        previousExperience: string
        references: Array<{
            name: string
            email: string
            relationship: string
        }>
        availabilityPeriod: {
            startDate: Date
            endDate: Date
            flexible: boolean
        }
        workCommitment: {
            hoursPerWeek: number
            daysPerWeek: number
            specificDays: string[]
        }
    }
    communityImpact: {
        focusAreas: string[]
        expectedOutcomes: string[]
        sustainabilityPlan: string
    }
    accommodation: {
        roomType: string
        mealsIncluded: boolean
        facilitiesProvided: string[]
    }
    status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'waitlisted'
    reviewNotes: string
    impactAgreement: {
        signed: boolean
        signedDate?: Date
        documentUrl?: string
        terms: string[]
    }
    emergencyContact: {
        name: string
        phone: string
        email: string
        relationship: string
    }
    submittedAt: Date
    reviewedAt?: Date
    reviewedBy?: Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const stayAndGiveSchema = new Schema<IStayAndGive>(
    {
        applicant: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        property: {
            type: Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
        },
        application: {
            motivationLetter: {
                type: String,
                required: [true, 'Motivation letter is required'],
                minlength: [200, 'Motivation letter must be at least 200 characters'],
                maxlength: [2000, 'Motivation letter cannot exceed 2000 characters'],
            },
            skills: [{
                type: String,
                required: true,
            }],
            projectProposal: {
                type: String,
                required: [true, 'Project proposal is required'],
                minlength: [100, 'Project proposal must be at least 100 characters'],
                maxlength: [1500, 'Project proposal cannot exceed 1500 characters'],
            },
            previousExperience: {
                type: String,
                required: true,
                maxlength: [1000, 'Previous experience cannot exceed 1000 characters'],
            },
            references: [{
                name: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    required: true,
                },
                relationship: {
                    type: String,
                    required: true,
                },
            }],
            availabilityPeriod: {
                startDate: {
                    type: Date,
                    required: true,
                },
                endDate: {
                    type: Date,
                    required: true,
                },
                flexible: {
                    type: Boolean,
                    default: false,
                },
            },
            workCommitment: {
                hoursPerWeek: {
                    type: Number,
                    required: true,
                    min: 5,
                    max: 40,
                },
                daysPerWeek: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 7,
                },
                specificDays: [{
                    type: String,
                }],
            },
        },
        communityImpact: {
            focusAreas: [{
                type: String,
                enum: [
                    'Education',
                    'Environment',
                    'Agriculture',
                    'Technology',
                    'Healthcare',
                    'Arts & Culture',
                    'Community Development',
                    'Tourism',
                    'Women Empowerment',
                    'Youth Development',
                ],
            }],
            expectedOutcomes: [{
                type: String,
            }],
            sustainabilityPlan: {
                type: String,
                required: true,
                maxlength: [1000, 'Sustainability plan cannot exceed 1000 characters'],
            },
        },
        accommodation: {
            roomType: {
                type: String,
                enum: ['Private Room', 'Shared Room', 'Dormitory', 'Flexible'],
                required: true,
            },
            mealsIncluded: {
                type: Boolean,
                default: true,
            },
            facilitiesProvided: [{
                type: String,
            }],
        },
        status: {
            type: String,
            enum: ['pending', 'under-review', 'approved', 'rejected', 'waitlisted'],
            default: 'pending',
        },
        reviewNotes: {
            type: String,
        },
        impactAgreement: {
            signed: {
                type: Boolean,
                default: false,
            },
            signedDate: Date,
            documentUrl: String,
            terms: [{
                type: String,
            }],
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
            email: {
                type: String,
                required: true,
            },
            relationship: {
                type: String,
                required: true,
            },
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        reviewedAt: Date,
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
stayAndGiveSchema.index({ applicant: 1, property: 1 })
stayAndGiveSchema.index({ status: 1 })
stayAndGiveSchema.index({ submittedAt: -1 })
stayAndGiveSchema.index({ 'application.availabilityPeriod.startDate': 1 })

// Validation: End date must be after start date
stayAndGiveSchema.pre('save', function (next) {
    if (this.application.availabilityPeriod.endDate <= this.application.availabilityPeriod.startDate) {
        next(new Error('End date must be after start date'))
    }
    next()
})

export default model<IStayAndGive>('StayAndGive', stayAndGiveSchema)
