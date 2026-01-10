import mongoose, { Schema, Document } from 'mongoose'

export interface IContact extends Document {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'responded'
  respondedAt?: Date
  response?: string
  createdAt: Date
}

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'responded'], default: 'new' },
    respondedAt: Date,
    response: String,
  },
  {
    timestamps: true,
  }
)

ContactSchema.index({ status: 1 })
ContactSchema.index({ createdAt: -1 })

export default mongoose.model<IContact>('Contact', ContactSchema)
