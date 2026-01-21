import { useState } from 'react'
import { Phone, ChevronDown } from 'lucide-react'
import { countries, validatePhoneNumber, Country } from '../../utils/phoneValidation'

interface PhoneInputProps {
    value: string
    onChange: (value: string, countryCode: string, isValid: boolean) => void
    label?: string
    placeholder?: string
    required?: boolean
    error?: string
    defaultCountry?: string
    countryCode?: string // Controlled country code
}

export default function PhoneInput({
    value,
    onChange,
    label = 'Phone Number',
    placeholder,
    required = false,
    error,
    defaultCountry = 'IN',
    countryCode
}: PhoneInputProps) {
    // If countryCode is provided (controlled), use it. Otherwise fall back to internal state or default.
    const [internalCountry, setInternalCountry] = useState<Country>(
        countries.find(c => c.code === defaultCountry) || countries[0]
    )

    const selectedCountry = countryCode
        ? (countries.find(c => c.code === countryCode) || internalCountry)
        : internalCountry

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const isValid = validatePhoneNumber(value || '', selectedCountry.code)

    const handleCountryChange = (country: Country) => {
        if (!countryCode) {
            setInternalCountry(country)
        }
        setIsDropdownOpen(false)
        const valid = validatePhoneNumber(value || '', country.code)
        onChange(value || '', country.code, valid)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        const valid = validatePhoneNumber(newValue, selectedCountry.code)
        onChange(newValue, selectedCountry.code, valid)
    }

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-neutral-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative space-y-3">
                {/* Country Selector */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center gap-2 px-3 py-3 bg-white border border-neutral-300 rounded-lg hover:border-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <span className="text-2xl">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium flex-1 text-left">{selectedCountry.name}</span>
                        <span className="text-sm font-medium text-neutral-600">{selectedCountry.dialCode}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                            {countries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountryChange(country)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left"
                                >
                                    <span className="text-2xl">{country.flag}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-neutral-900">{country.name}</p>
                                        <p className="text-xs text-neutral-600">{country.dialCode}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        <Phone className="w-5 h-5" />
                    </div>
                    <input
                        type="tel"
                        value={value || ''}
                        onChange={handlePhoneChange}
                        placeholder={placeholder || selectedCountry.placeholder}
                        required={required}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${error
                            ? 'border-red-300 focus:ring-red-500'
                            : value && !isValid
                                ? 'border-amber-300 focus:ring-amber-500'
                                : value && isValid
                                    ? 'border-green-300 focus:ring-green-500'
                                    : 'border-neutral-300 focus:ring-primary-500'
                            }`}
                    />
                    {value && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValid ? (
                                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Helper Text */}
            {value && !isValid && !error && (
                <p className="text-xs text-amber-600 mt-1">
                    Please enter a valid {selectedCountry.name} phone number (Format: {selectedCountry.format})
                </p>
            )}
            {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
            {value && isValid && (
                <p className="text-xs text-green-600 mt-1">
                    ✓ Valid phone number: {selectedCountry.dialCode} {value}
                </p>
            )}
        </div>
    )
}
