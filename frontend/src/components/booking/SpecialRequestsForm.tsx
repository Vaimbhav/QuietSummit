import { useState } from 'react';

interface SpecialRequestsFormProps {
    specialRequests: {
        arrivalTime: string;
        requests: string;
        tripPurpose: string;
    };
    onUpdate: (data: { arrivalTime: string; requests: string; tripPurpose: string }) => void;
}

export default function SpecialRequestsForm({ specialRequests, onUpdate }: SpecialRequestsFormProps) {
    const [formData, setFormData] = useState(specialRequests);

    const handleChange = (field: string, value: string) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onUpdate(updated);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Let the host know about any special requirements or preferences for your stay.
                </p>
            </div>

            {/* Arrival Time */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Arrival Time
                </label>
                <select
                    value={formData.arrivalTime}
                    onChange={(e) => handleChange('arrivalTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="">Select arrival time</option>
                    <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                    <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
                    <option value="night">Night (8:00 PM - 12:00 AM)</option>
                    <option value="flexible">Flexible</option>
                </select>
            </div>

            {/* Trip Purpose */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Trip
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Leisure', 'Business', 'Other'].map((purpose) => (
                        <button
                            key={purpose}
                            type="button"
                            onClick={() => handleChange('tripPurpose', purpose)}
                            className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${formData.tripPurpose === purpose
                                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                }`}
                        >
                            {purpose}
                        </button>
                    ))}
                </div>
            </div>

            {/* Special Requests */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requests or Notes
                </label>
                <textarea
                    value={formData.requests}
                    onChange={(e) => handleChange('requests', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="E.g., dietary restrictions, accessibility needs, early check-in request, etc."
                />
                <p className="mt-2 text-xs text-gray-500">
                    {formData.requests.length}/500 characters
                </p>
            </div>

            {/* Common Requests */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Common Requests</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        'Early check-in',
                        'Late check-out',
                        'Airport pickup',
                        'Extra towels',
                        'Baby cot',
                        'High chair',
                    ].map((request) => (
                        <button
                            key={request}
                            type="button"
                            onClick={() => {
                                const currentRequests = formData.requests;
                                const newRequest = currentRequests
                                    ? `${currentRequests}\n• ${request}`
                                    : `• ${request}`;
                                handleChange('requests', newRequest);
                            }}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
                        >
                            + {request}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-amber-900">Please Note</p>
                        <p className="text-sm text-amber-700 mt-1">
                            Special requests are subject to availability and may incur additional charges. The host will
                            confirm your requests after booking.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
