import { Schema, model, Document } from 'mongoose';

export interface IIndianCity extends Document {
    city: string;
    state: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    population?: number;
    type: 'city' | 'town' | 'village' | 'locality';
}

const IndianCitySchema = new Schema<IIndianCity>({
    city: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    state: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    district: {
        type: String,
        trim: true
    },
    latitude: Number,
    longitude: Number,
    population: Number,
    type: {
        type: String,
        enum: ['city', 'town', 'village', 'locality'],
        default: 'city'
    }
}, {
    timestamps: true
});

// Compound index for efficient searching
IndianCitySchema.index({ city: 1, state: 1 });
IndianCitySchema.index({ city: 'text', state: 'text' });

const IndianCity = model<IIndianCity>('IndianCity', IndianCitySchema);

export default IndianCity;
