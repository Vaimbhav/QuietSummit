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
    darkMode?: boolean
}

export default function PhoneInput({
    value,
    onChange,
    label = 'Phone Number',
    placeholder,
    required = false,
    error,
    defaultCountry = 'IN',
    countryCode,
    darkMode = false
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

    // Styles based on darkMode
    const containerClasses = darkMode
        ? "bg-[#0b162c] border-[1px] border-[rgba(92,225,230,0.2)] text-gray-200"
        : "bg-white border-neutral-300 hover:border-primary-500 focus:ring-primary-300";

    const dropdownClasses = darkMode
        ? "bg-[#0f172a] border-[rgba(92,225,230,0.2)] text-gray-200"
        : "bg-white border-neutral-200 text-neutral-900";

    const itemHoverClass = darkMode ? "hover:bg-[#1e293b]" : "hover:bg-primary-50";

    return (
        <div className="space-y-1">
            {label && (
                <label className={`block text-[11px] font-bold ${darkMode ? 'text-gray-400' : 'text-neutral-700'}`}>
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
            )}

            <div className="relative flex flex-col md:flex-row gap-3">
                {/* Country Selector */}
                <div className="relative md:w-1/3">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full h-12 flex items-center gap-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500 ${containerClasses}`}
                    >
                        <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis truncate">{selectedCountry.name}</span>
                        <span className="text-sm font-medium opacity-80">{selectedCountry.dialCode}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div className={`absolute top-full left-0 mt-1 w-[300px] md:w-full rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto border ${dropdownClasses}`}>
                            {countries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountryChange(country)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${itemHoverClass}`}
                                >
                                    <span className="text-xl">{country.flag}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{country.name}</p>
                                        <p className="text-xs opacity-70">{country.dialCode}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="relative flex-1">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-neutral-400'}`}>
                        <Phone className="w-4 h-4" />
                    </div>
                    <input
                        type="tel"
                        value={value}
                        onChange={handlePhoneChange}
                        placeholder={placeholder}
                        className={`w-full h-12 pl-10 pr-4 text-sm rounded-lg border transition-all focus:outline-none focus:ring-1 focus:ring-teal-500 ${containerClasses}`}
                    />
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
