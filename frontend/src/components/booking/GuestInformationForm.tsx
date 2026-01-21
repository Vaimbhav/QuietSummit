import { useState } from 'react';
import PhoneInput from '../common/PhoneInput';
import { countries } from '../../utils/phoneValidation';

interface Guest {
    name: string;
    age: number;
}

interface GuestInformationFormProps {
    guests: number;
    primaryGuest: {
        name: string;
        email: string;
        phone: string;
        country: string;
    };
    additionalGuests: Guest[];
    onUpdate: (data: {
        primaryGuest: { name: string; email: string; phone: string; country: string };
        additionalGuests: Guest[];
    }) => void;
}

export default function GuestInformationForm({
    guests,
    primaryGuest,
    additionalGuests,
    onUpdate,
}: GuestInformationFormProps) {
    const [formData, setFormData] = useState({
        primaryGuest,
        additionalGuests,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handlePrimaryGuestChange = (field: string, value: string) => {
        const updated = {
            ...formData,
            primaryGuest: { ...formData.primaryGuest, [field]: value },
        };
        setFormData(updated);
        onUpdate(updated);

        // Clear error for this field
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleAdditionalGuestChange = (index: number, field: string, value: string | number) => {
        const updatedGuests = [...formData.additionalGuests];
        updatedGuests[index] = { ...updatedGuests[index], [field]: value };
        const updated = {
            ...formData,
            additionalGuests: updatedGuests,
        };
        setFormData(updated);
        onUpdate(updated);
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    return (
        <div className="space-y-8">
            {/* Primary Guest */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Guest Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.primaryGuest.name}
                            onChange={(e) => handlePrimaryGuestChange('name', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-300 bg-white font-medium text-gray-900"
                            placeholder="John Doe"
                            required
                            aria-label="Primary guest full name"
                        />
                        {errors.name && <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.primaryGuest.email}
                            onChange={(e) => handlePrimaryGuestChange('email', e.target.value)}
                            onBlur={(e) => {
                                if (!validateEmail(e.target.value)) {
                                    setErrors({ ...errors, email: 'Please enter a valid email address' });
                                }
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-300 bg-white font-medium text-gray-900"
                            placeholder="john@example.com"
                            required
                            aria-label="Primary guest email address"
                        />
                        {errors.email && <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.email}</p>}
                    </div>

                    <div>
                        <PhoneInput
                            label="Phone Number *"
                            value={formData.primaryGuest.phone}
                            onChange={(phone: string, countryCode: string) => {
                                // Update phone and sync country
                                const country = countries.find(c => c.code === countryCode);
                                const updated = {
                                    ...formData,
                                    primaryGuest: {
                                        ...formData.primaryGuest,
                                        phone,
                                        country: country ? country.name : formData.primaryGuest.country
                                    },
                                };
                                setFormData(updated);
                                onUpdate(updated);

                                // Clear phone error
                                if (errors.phone) {
                                    setErrors({ ...errors, phone: '' });
                                }
                            }}
                            // Derive country code from the selected country name
                            countryCode={countries.find(c => c.name === formData.primaryGuest.country)?.code}
                            defaultCountry="IN"
                        />
                        {errors.phone && <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country/Region <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <select
                                value={formData.primaryGuest.country}
                                onChange={(e) => handlePrimaryGuestChange('country', e.target.value)}
                                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white cursor-pointer hover:border-gray-300 transition-all font-medium text-gray-900"
                                required
                                aria-label="Primary guest country"
                            >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country.code} value={country.name}>{country.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Guests */}
            {guests > 1 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Additional Guests ({guests - 1})
                    </h3>
                    <div className="space-y-4">
                        {Array.from({ length: guests - 1 }, (_, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Guest {index + 2}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.additionalGuests[index]?.name || ''}
                                            onChange={(e) => handleAdditionalGuestChange(index, 'name', e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-300 bg-white font-medium text-gray-900"
                                            placeholder="Guest name"
                                            required
                                            aria-label={`Guest ${index + 2} name`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Age <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.additionalGuests[index]?.age || ''}
                                            onChange={(e) => handleAdditionalGuestChange(index, 'age', parseInt(e.target.value) || 0)}
                                            min="1"
                                            max="120"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-gray-300 bg-white font-medium text-gray-900"
                                            placeholder="Age"
                                            required
                                            aria-label={`Guest ${index + 2} age`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-blue-900">Guest Information</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Please ensure all guest names match their government-issued IDs for check-in purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
