import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Plus, Minus, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react'
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
    onClose?: () => void
}

interface Traveler {
    name: string
    age: number | ''
    gender: 'male' | 'female' | 'other'
    emergencyContact: string
    emergencyContactCountry?: string
}

export default function TravelerInfoStep({
    journey,
    bookingData,
    onNext,
}: TravelerInfoStepProps) {
    const navigate = useNavigate()
    const { isAuthenticated, user: userData } = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showLoginRequired, setShowLoginRequired] = useState(false)
    const [numberOfTravelers, setNumberOfTravelers] = useState(bookingData.numberOfTravelers || 1)

    // Use departure date from journey (fixed) or fallback
    const departureDate = journey.departureDates && journey.departureDates.length > 0
        ? journey.departureDates[0]
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    useEffect(() => {
        if (!isAuthenticated) {
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
            : Array.from({ length: numberOfTravelers }, (_, i) => ({
                name: i === 0 ? userData?.name || '' : '',
                age: '',
                gender: 'male' as const,
                emergencyContact: i === 0 ? userData?.phone || '' : '',
            }))
    )

    // Update travelers array when number changes
    useEffect(() => {
        const currentLength = travelers.length
        if (numberOfTravelers > currentLength) {
            setTravelers([
                ...travelers,
                ...Array.from({ length: numberOfTravelers - currentLength }, () => ({
                    name: '',
                    age: '',
                    gender: 'male' as const,
                    emergencyContact: '',
                }))
            ])
        } else if (numberOfTravelers < currentLength) {
            setTravelers(travelers.slice(0, numberOfTravelers))
        }
    }, [numberOfTravelers])

    const updateTraveler = (index: number, field: keyof Traveler, value: any) => {
        setTravelers(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    const handleNext = () => {
        // Validate email
        if (!userData?.email) {
            alert('Email is required. Please ensure you are logged in with a valid email.')
            return
        }

        // Validation
        for (let i = 0; i < travelers.length; i++) {
            if (!travelers[i].name || !travelers[i].age) {
                alert(`Please fill all details for Traveler ${i + 1}`)
                return
            }
            if (travelers[i].age === '') {
                alert(`Please enter a valid age for Traveler ${i + 1}`)
                return
            }
            const travelerAge = travelers[i].age as number
            if (travelerAge < 1 || travelerAge > 120) {
                alert(`Please enter a valid age for Traveler ${i + 1}`)
                return
            }
            if (!travelers[i].emergencyContact || travelers[i].emergencyContact.trim() === '') {
                alert(`Please provide an emergency contact number for Traveler ${i + 1}`)
                return
            }
        }

        // Calculate pricing
        const basePrice = journey.basePrice * numberOfTravelers
        const taxes = basePrice * 0.18
        const totalAmount = basePrice + taxes

        onNext({
            numberOfTravelers,
            travelers,
            departureDate,
            email: userData?.email || '',
            basePrice,
            addOnsTotal: 0,
            taxes,
            totalAmount,
            addOns: [],
            specialRequests: '',
            roomPreference: 'double',
        })
    }

    return (
        <div className="flex flex-col h-full bg-neutral-50/50">
            <div className="flex-1 p-4 md:p-6 space-y-8 overflow-y-auto pb-24">
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => {
                        const updatedUser = localStorage.getItem('quietsummit_user')
                        if (updatedUser) {
                            setShowLoginModal(false)
                            window.location.reload()
                        } else {
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
                                        localStorage.setItem('redirectAfterLogin', window.location.pathname)
                                        navigate('/signup')
                                    }}
                                    variant="outline"
                                    size="lg"
                                    className="w-full font-bold"
                                >
                                    Become a Member
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Only show form if authenticated and not showing login required */}
                {isAuthenticated && !showLoginRequired && (
                    <>
                        {/* Number of Travelers */}
                        <div className="bg-white rounded-xl p-4 border border-neutral-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900">Number of Travelers</h3>
                                    <p className="text-neutral-500 text-xs mt-1">Select how many people are joining</p>
                                </div>

                                <div className="flex items-center gap-3 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                                    <button
                                        onClick={() => setNumberOfTravelers(Math.max(1, numberOfTravelers - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={numberOfTravelers <= 1}
                                        aria-label="Decrease number of travelers"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    <div className="min-w-[40px] text-center">
                                        <span className="text-lg font-bold text-neutral-900">{numberOfTravelers}</span>
                                    </div>

                                    <button
                                        onClick={() => setNumberOfTravelers(Math.min(10, numberOfTravelers + 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={numberOfTravelers >= 10}
                                        aria-label="Increase number of travelers"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Traveler Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <User className="w-5 h-5 text-neutral-900" />
                                <h3 className="text-lg font-bold text-neutral-900">Traveler Details</h3>
                            </div>

                            {travelers.map((traveler, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm transition-all hover:border-neutral-300">
                                    <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                                        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            Traveler {index + 1}
                                        </h4>
                                        {index === 0 && (
                                            <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 uppercase tracking-wide">
                                                Lead
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-neutral-700">Full Name *</label>
                                            <Input
                                                value={traveler.name}
                                                onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                                                placeholder="Enter full name"
                                                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-neutral-700">Age *</label>
                                                <Input
                                                    type="number"
                                                    value={traveler.age}
                                                    onChange={(e) => updateTraveler(index, 'age', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                    placeholder="Age"
                                                    min="1"
                                                    max="120"
                                                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all h-[42px]"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-neutral-700">Gender *</label>
                                                <div className="relative">
                                                    <select
                                                        value={traveler.gender}
                                                        onChange={(e) => updateTraveler(index, 'gender', e.target.value as 'male' | 'female' | 'other')}
                                                        className="appearance-none w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white font-medium text-neutral-900 h-[42px]" aria-label="Select gender"                                                    >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="block text-xs font-bold text-neutral-700">
                                                Phone Number *
                                            </label>
                                            <PhoneInput
                                                value={traveler.emergencyContact}
                                                onChange={(phone, countryCode) => {
                                                    updateTraveler(index, 'emergencyContact', phone)
                                                    updateTraveler(index, 'emergencyContactCountry', countryCode)
                                                }}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Fixed Bottom Button */}
            {isAuthenticated && !showLoginRequired && (
                <div className="bg-white px-4 py-5 border-t border-neutral-200/80 sticky bottom-0 left-0 right-0 z-[100] w-full mt-auto">
                    <button
                        onClick={handleNext}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 active:scale-[0.98] text-base"
                    >
                        Continue <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    )
}
