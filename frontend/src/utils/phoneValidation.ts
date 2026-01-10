// Phone validation utilities for different countries

export interface Country {
    code: string
    name: string
    dialCode: string
    flag: string
    placeholder: string
    regex: RegExp
    format: string
}

export const countries: Country[] = [
    {
        code: 'IN',
        name: 'India',
        dialCode: '+91',
        flag: '🇮🇳',
        placeholder: '98765 43210',
        regex: /^[6-9]\d{9}$/,
        format: 'XXXXX XXXXX'
    },
    {
        code: 'US',
        name: 'United States',
        dialCode: '+1',
        flag: '🇺🇸',
        placeholder: '(555) 123-4567',
        regex: /^\d{10}$/,
        format: '(XXX) XXX-XXXX'
    },
    {
        code: 'GB',
        name: 'United Kingdom',
        dialCode: '+44',
        flag: '🇬🇧',
        placeholder: '7400 123456',
        regex: /^[1-9]\d{9,10}$/,
        format: 'XXXX XXXXXX'
    },
    {
        code: 'AU',
        name: 'Australia',
        dialCode: '+61',
        flag: '🇦🇺',
        placeholder: '412 345 678',
        regex: /^[4-5]\d{8}$/,
        format: 'XXX XXX XXX'
    },
    {
        code: 'CA',
        name: 'Canada',
        dialCode: '+1',
        flag: '🇨🇦',
        placeholder: '(555) 123-4567',
        regex: /^\d{10}$/,
        format: '(XXX) XXX-XXXX'
    },
    {
        code: 'AE',
        name: 'United Arab Emirates',
        dialCode: '+971',
        flag: '🇦🇪',
        placeholder: '50 123 4567',
        regex: /^[5][0-9]{8}$/,
        format: 'XX XXX XXXX'
    },
    {
        code: 'SG',
        name: 'Singapore',
        dialCode: '+65',
        flag: '🇸🇬',
        placeholder: '8123 4567',
        regex: /^[89]\d{7}$/,
        format: 'XXXX XXXX'
    },
    {
        code: 'MY',
        name: 'Malaysia',
        dialCode: '+60',
        flag: '🇲🇾',
        placeholder: '12-345 6789',
        regex: /^1[0-9]{8,9}$/,
        format: 'XX-XXX XXXX'
    }
]

export const validatePhoneNumber = (phoneNumber: string, countryCode: string): boolean => {
    const country = countries.find(c => c.code === countryCode)
    if (!country) return false

    // Remove spaces, dashes, and other formatting
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')

    return country.regex.test(cleanNumber)
}

export const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
    const country = countries.find(c => c.code === countryCode)
    if (!country) return phoneNumber

    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')

    // Format based on country
    if (countryCode === 'IN') {
        // Indian format: XXXXX XXXXX
        if (cleanNumber.length === 10) {
            return `${cleanNumber.slice(0, 5)} ${cleanNumber.slice(5)}`
        }
    } else if (countryCode === 'US' || countryCode === 'CA') {
        // US/Canada format: (XXX) XXX-XXXX
        if (cleanNumber.length === 10) {
            return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`
        }
    }

    return cleanNumber
}

export const getFullPhoneNumber = (phoneNumber: string, countryCode: string): string => {
    const country = countries.find(c => c.code === countryCode)
    if (!country) return phoneNumber

    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')
    return `${country.dialCode}${cleanNumber}`
}
