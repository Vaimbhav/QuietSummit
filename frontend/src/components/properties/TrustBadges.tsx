import { CheckCircle, Shield, Clock, Key } from 'lucide-react';

interface TrustBadge {
    icon: React.ElementType;
    label: string;
    color: string;
}

const badges: TrustBadge[] = [
    { icon: CheckCircle, label: 'Verified Property', color: 'text-green-600 bg-green-50' },
    { icon: Shield, label: 'Secure Booking', color: 'text-blue-600 bg-blue-50' },
    { icon: Clock, label: 'Instant Confirmation', color: 'text-purple-600 bg-purple-50' },
    { icon: Key, label: 'Self Check-in', color: 'text-orange-600 bg-orange-50' },
];

export default function TrustBadges() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                    <div
                        key={index}
                        className={`flex items-center gap-3 p-4 rounded-2xl border border-gray-100 ${badge.color} transition-all hover:scale-105 hover:shadow-md`}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-semibold">{badge.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
