import { Schema, model, Document, Types } from 'mongoose';

export interface IBlockedDate {
    startDate: Date;
    endDate: Date;
    reason?: 'booked' | 'maintenance' | 'personal' | 'other';
    note?: string;
}

export interface ICalendar extends Document {
    property: Types.ObjectId;
    blockedDates: IBlockedDate[];
    createdAt: Date;
    updatedAt: Date;
}

const CalendarSchema = new Schema<ICalendar>(
    {
        property: {
            type: Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
            unique: true,
        },
        blockedDates: [
            {
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },
                reason: {
                    type: String,
                    enum: ['booked', 'maintenance', 'personal', 'other'],
                    default: 'other',
                },
                note: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for efficient date range queries
CalendarSchema.index({ 'blockedDates.startDate': 1, 'blockedDates.endDate': 1 });

export default model<ICalendar>('Calendar', CalendarSchema);
