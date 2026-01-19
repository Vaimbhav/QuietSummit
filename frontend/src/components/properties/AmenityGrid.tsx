import { Wifi, Car, Coffee, Tv, Wind, Utensils, Waves, Mountain, Users, Home } from 'lucide-react';

interface AmenityGridProps {
    amenities: string[];
}

const amenityIcons: Record<string, React.ElementType> = {
    'WiFi': Wifi,
    'wifi': Wifi,
    'Free Parking': Car,
    'parking': Car,
    'Kitchen': Utensils,
    'kitchen': Utensils,
    'TV': Tv,
    'tv': Tv,
    'Air Conditioning': Wind,
    'ac': Wind,
    'Coffee Maker': Coffee,
    'Pool': Waves,
    'pool': Waves,
    'Mountain View': Mountain,
    'view': Mountain,
    'Family Friendly': Users,
    'Entire Home': Home,
    'Washer': Waves,
    'washer': Waves,
    'Dryer': Wind,
    'dryer': Wind,
    'Iron': Utensils,
    'Heating': Wind,
    'heater': Wind,
    'Dedicated Workspace': Wifi,
    'Hair Dryer': Wind,
    'Smoke Alarm': Home,
    'Carbon Monoxide Alarm': Home,
    'Fire Extinguisher': Home,
    'First Aid Kit': Home,
};

export default function AmenityGrid({ amenities }: AmenityGridProps) {
    const displayAmenities = amenities.slice(0, 8);
    const remainingCount = Math.max(0, amenities.length - 8);

    const getIcon = (amenity: string) => {
        // Try to find matching icon
        for (const [key, Icon] of Object.entries(amenityIcons)) {
            if (amenity.toLowerCase().includes(key.toLowerCase())) {
                return Icon;
            }
        }
        return Home; // Default icon
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayAmenities.map((amenity, index) => {
                    const Icon = getIcon(amenity);
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <Icon className="w-6 h-6 text-primary-600" />
                            </div>
                            <span className="font-medium text-gray-900">{amenity}</span>
                        </div>
                    );
                })}
            </div>
            {remainingCount > 0 && (
                <button className="mt-6 px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                    Show all {amenities.length} amenities
                </button>
            )}
        </div>
    );
}
