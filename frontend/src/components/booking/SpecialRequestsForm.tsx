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
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Special Requests</h3>
                <p className="text-sm mb-6" style={{ color: '#B0B7C3' }}>
                    Let the host know about any special requirements or preferences for your stay.
                </p>
            </div>

            {/* Arrival Time */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B0B7C3' }}>
                    Estimated Arrival Time
                </label>
                <select
                    value={formData.arrivalTime}
                    onChange={(e) => handleChange('arrivalTime', e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl appearance-none cursor-pointer font-medium shadow-sm transition-all bg-no-repeat"
                    style={{
                        background: 'rgba(30, 33, 57, 0.6) url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==\') center right 1rem no-repeat',
                        border: '2px solid rgba(92, 225, 230, 0.2)',
                        color: '#ffffff'
                    }}
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
                <label className="block text-sm font-medium mb-2" style={{ color: '#B0B7C3' }}>
                    Purpose of Trip
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Leisure', 'Business', 'Other'].map((purpose) => (
                        <button
                            key={purpose}
                            type="button"
                            onClick={() => handleChange('tripPurpose', purpose)}
                            className="px-4 py-3 rounded-lg font-medium transition-all"
                            style={{
                                border: formData.tripPurpose === purpose ? '2px solid #5CE1E6' : '2px solid rgba(92, 225, 230, 0.3)',
                                background: formData.tripPurpose === purpose ? 'rgba(92, 225, 230, 0.15)' : 'transparent',
                                color: formData.tripPurpose === purpose ? '#5CE1E6' : '#B0B7C3'
                            }}
                        >
                            {purpose}
                        </button>
                    ))}
                </div>
            </div>

            {/* Special Requests */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B0B7C3' }}>
                    Additional Requests or Notes
                </label>
                <textarea
                    value={formData.requests}
                    onChange={(e) => handleChange('requests', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg resize-none"
                    style={{
                        background: 'rgba(30, 33, 57, 0.6)',
                        border: '2px solid rgba(92, 225, 230, 0.2)',
                        color: '#ffffff'
                    }}
                    placeholder="E.g., dietary restrictions, accessibility needs, early check-in request, etc."
                />
                <p className="mt-2 text-xs" style={{ color: '#B0B7C3' }}>
                    {formData.requests.length}/500 characters
                </p>
            </div>

            {/* Common Requests */}
            <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: '#B0B7C3' }}>Common Requests</h4>
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
                            className="px-4 py-2 text-sm rounded-lg text-left transition-colors"
                            style={{
                                border: '1px solid rgba(92, 225, 230, 0.3)',
                                color: '#B0B7C3',
                                background: 'rgba(30, 33, 57, 0.4)'
                            }}
                        >
                            + {request}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-lg p-4" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <div className="flex gap-3">
                    <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: '#fbbf24' }}
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
                        <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>Please Note</p>
                        <p className="text-sm mt-1" style={{ color: '#B0B7C3' }}>
                            Special requests are subject to availability and may incur additional charges. The host will
                            confirm your requests after booking.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
