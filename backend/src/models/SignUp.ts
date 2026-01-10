import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface ISignUp extends Document {
    name: string
    email: string
    password: string
    phone?: string
    interests: string[]
    source: string
    subscribeToNewsletter: boolean
    status: 'pending' | 'confirmed' | 'unsubscribed'
    confirmationToken?: string
    confirmationTokenExpiry?: Date
    createdAt: Date
    confirmedAt?: Date
    googleId?: string
    comparePassword(candidatePassword: string): Promise<boolean>
}

const SignUpSchema = new Schema<ISignUp>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, select: false },
        phone: { type: String },
        interests: [String],
        source: { type: String, default: 'website' },
        subscribeToNewsletter: { type: Boolean, default: true },
        status: { type: String, enum: ['pending', 'confirmed', 'unsubscribed'], default: 'confirmed' },
        confirmationToken: String,
        confirmationTokenExpiry: Date,
        confirmedAt: Date,
        googleId: { type: String, sparse: true, unique: true },
    },
    {
        timestamps: true,
    }
)

// Hash password before saving
SignUpSchema.pre('save', async function () {
    if (!this.isModified('password')) return

    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    } catch (error: any) {
        throw error
    }
})

// Method to compare password
SignUpSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password)
    } catch (error) {
        return false
    }
}

// Index for status queries
SignUpSchema.index({ status: 1 })

export default mongoose.model<ISignUp>('SignUp', SignUpSchema)
