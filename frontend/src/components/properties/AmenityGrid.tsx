import { useState } from 'react';
import { Wifi, Car, Coffee, Tv, Wind, Utensils, Waves, Mountain, Users, Home, ChevronDown, ChevronUp } from 'lucide-react';

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
    const [isExpanded, setIsExpanded] = useState(false);

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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 bg-gradient-to-br from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Home className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-gray-900">What this place offers</h2>
                        <p className="text-sm text-gray-600 mt-1">{amenities.length} amenities</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-600 shrink-0" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600 shrink-0" />
                )}
            </button>

            {isExpanded && (
                <div className="p-6 pt-4 bg-white border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {amenities.map((amenity, index) => {
                            const Icon = getIcon(amenity);
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                        <Icon className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">{amenity}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
