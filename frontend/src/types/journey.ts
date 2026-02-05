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

    // Booking Fields
    price: number;
    registrationPrice?: number;

    departureDate?: string | Date;
    totalSeats?: number;
    bookedSeats?: number;

    margin: number;
    includes: string[];
    excludes: string[];
    itinerary: ItineraryDay[];
    images: string[];
    testimonials: Testimonial[];
    createdAt: string;
    updatedAt: string;
}
