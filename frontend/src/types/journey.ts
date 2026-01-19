export interface Location {
    region: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface ItineraryDay {
    day: number;
    title: string;
    description: string;
    activities: string[];
    meals: string[];
    accommodation: string;
    imageUrl?: string;
}

export interface Testimonial {
    author: string;
    rating: number;
    text: string;
}

export interface Journey {
    _id: string;
    title: string;
    slug: string;
    description: string;
    destination: string;
    status: 'draft' | 'published' | 'archived';
    location: Location;
    duration: {
        days: number;
        nights: number;
    } | number;
    difficulty: 'easy' | 'moderate' | 'challenging';
    idealFor: string[];
    season: string[];
    maxGroupSize: number;
    price: number; // Using basePrice as price
    basePrice: number;
    margin: number;
    includes: string[];
    excludes: string[];
    itinerary: ItineraryDay[];
    images: string[];
    testimonials: Testimonial[];
    departureDates?: string[]; // Fixed departure dates
    createdAt: string;
    updatedAt: string;
}
