import mongoose, { Document, Schema } from 'mongoose'

export interface IPayout extends Document {
    hostId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    method: 'bank_transfer' | 'paypal' | 'stripe';
    details: {
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        ifsc?: string;
        paypalEmail?: string;
    };
    referenceId?: string;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const payoutSchema = new Schema<IPayout>(
    {
        hostId: {
            type: Schema.Types.ObjectId,
            ref: 'SignUp',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
        },
        method: {
            type: String,
            enum: ['bank_transfer', 'paypal', 'stripe'],
            required: true,
        },
        details: {
            accountName: String,
            accountNumber: String,
            bankName: String,
            ifsc: String,
            paypalEmail: String,
        },
        referenceId: String,
        processedAt: Date,
    },
    {
        timestamps: true,
    }
)

export default mongoose.model<IPayout>('Payout', payoutSchema)
