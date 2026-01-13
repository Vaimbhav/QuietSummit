import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, AlertCircle } from 'lucide-react'
import Button from '../../common/Button'
import Input from '../../common/Input'
import PhoneInput from '../../common/PhoneInput'
import LoginModal from '../../common/LoginModal'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'
import { useAuth } from '@/hooks/useAuth'

interface TravelerInfoStepProps {
    journey: Journey
    bookingData: Partial<BookingData>
    onNext: (data: Partial<BookingData>) => void
    onBack: () => void
}

interface Traveler {
    name: string
    age: number
    gender: 'male' | 'female' | 'other'
    emergencyContact: string
    emergencyContactCountry?: string
}

export default function TravelerInfoStep({
    journey: _journey,
    bookingData,
    onNext,
    onBack,
}: TravelerInfoStepProps) {
    const navigate = useNavigate()
    const { isAuthenticated, user: userData } = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showLoginRequired, setShowLoginRequired] = useState(false)

    useEffect(() => {
        // Check if user is logged in, if not show modal immediately
        if (!isAuthenticated) {
            // Store current page for redirect after signup
            const currentPath = window.location.pathname
            localStorage.setItem('redirectAfterLogin', currentPath)
            setShowLoginModal(true)
        }
    }, [isAuthenticated])

    const [travelers, setTravelers] = useState<Traveler[]>(
        bookingData.travelers && bookingData.travelers.length > 0
            ? bookingData.travelers.map(t => ({
                ...t,
                emergencyContact: t.emergencyContact || '',
            }))
            : Array.from({ length: bookingData.numberOfTravelers || 1 }, (_, i) => ({
                name: i === 0 ? userData?.name || '' : '',
                age: 0,
                gender: 'male' as const,
                emergencyContact: '',
            }))
    )

    const updateTraveler = (index: number, field: keyof Traveler, value: any) => {
        const updated = [...travelers]
        updated[index] = { ...updated[index], [field]: value }
        setTravelers(updated)
    }

    const handleNext = () => {
        // Validation
        for (let i = 0; i < travelers.length; i++) {
            if (!travelers[i].name || !travelers[i].age) {
                alert(`Please fill all details for Traveler ${i + 1}`)
                return
            }
            if (travelers[i].age < 1 || travelers[i].age > 120) {
                alert(`Please enter a valid age for Traveler ${i + 1}`)
                return
            }
        }

        onNext({
            travelers,
            email: userData?.email || '',
        })
    }

    return (
        <div className="space-y-6">
            {/* Login Modal - Show if not authenticated */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => {
                    const updatedUser = localStorage.getItem('quietsummit_user')
                    if (updatedUser) {
                        // User logged in successfully - stay on same page
                        setShowLoginModal(false)
                        setShowLoginRequired(false)
                        window.location.reload() // Reload to update booking data with user info
                    } else {
                        // User closed modal without logging in - show message
                        setShowLoginModal(false)
                        setShowLoginRequired(true)
                    }
                }}
            />

            {/* Show login required message if user refused to login */}
            {showLoginRequired && (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center max-w-md p-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <AlertCircle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-3">Login Required to Proceed</h3>
                        <p className="text-neutral-600 mb-6 leading-relaxed">
                            Please login or become a Quiet Believer to continue with your booking.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => {
                                    setShowLoginRequired(false)
                                    setShowLoginModal(true)
                                }}
                                variant="primary"
                                size="lg"
                                className="w-full font-bold"
                            >
                                Login to Continue
                            </Button>
                            <Button
                                onClick={() => {
                                    // Store current URL for redirect after signup
                                    localStorage.setItem('redirectAfterLogin', window.location.pathname)
                                    navigate('/signup')
                                }}
                                variant="outline"
                                size="lg"
                                className="w-full font-bold"
                            >
                                Become a Member
                            </Button>
                            <Button
                                onClick={onBack}
                                variant="ghost"
                                size="md"
                                className="w-full"
                            >
                                ← Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Only show traveler form if user is authenticated */}
            {isAuthenticated && !showLoginRequired ? (
                <>
                    <div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Traveler Information</h3>
                        <p className="text-neutral-600">
                            Please provide details for all {bookingData.numberOfTravelers} travelers
                        </p>
                    </div>

                    <div className="space-y-6">
                        {travelers.map((traveler, index) => (
                            <div
                                key={index}
                                className="p-6 bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-2xl border border-neutral-200"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <h4 className="text-lg font-bold text-neutral-900">
                                        Traveler {index + 1}
                                        {index === 0 && (
                                            <span className="ml-2 text-sm font-normal text-neutral-600">
                                                (Lead Traveler)
                                            </span>
                                        )}
                                    </h4>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        type="text"
                                        value={traveler.name}
                                        onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                        leftIcon={<User className="w-5 h-5" />}
                                    />

                                    <Input
                                        label="Age"
                                        type="number"
                                        value={traveler.age || ''}
                                        onChange={(e) =>
                                            updateTraveler(index, 'age', parseInt(e.target.value) || 0)
                                        }
                                        placeholder="Enter age"
                                        required
                                        min={1}
                                        max={120}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            value={traveler.gender}
                                            onChange={(e) =>
                                                updateTraveler(
                                                    index,
                                                    'gender',
                                                    e.target.value as 'male' | 'female' | 'other'
                                                )
                                            }
                                            className="w-full px-4 py-3 pr-8 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <PhoneInput
                                            label="Emergency Contact"
                                            value={traveler.emergencyContact}
                                            onChange={(phone, countryCode) => {
                                                updateTraveler(index, 'emergencyContact', phone)
                                                updateTraveler(index, 'emergencyContactCountry', countryCode)
                                            }}
                                            defaultCountry="IN"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col gap-3 pt-4">
                        <Button onClick={handleNext} size="lg" className="w-full whitespace-nowrap">
                            Continue to Add-Ons →
                        </Button>
                        <Button variant="outline" onClick={onBack} className="w-full whitespace-nowrap">
                            ← Back
                        </Button>
                    </div>
                </>
            ) : null}
        </div>
    )
}
