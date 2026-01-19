import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Plus, Minus, Phone, AlertCircle, ArrowRight } from 'lucide-react'
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
                age: 25,
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
                    age: 25,
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
        <div className="space-y-8">
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
                    <div className="bg-gradient-to-br from-primary-50 via-accent-50 to-primary-50 rounded-[2rem] p-5 md:p-6 border-2 border-primary-100/50 shadow-xl backdrop-blur-sm">
                        <div className="mb-4">
                            <h3 className="text-xl md:text-2xl font-black text-neutral-900 mb-1 tracking-tight">Number of Travelers</h3>
                            <p className="text-neutral-600 text-xs md:text-sm leading-relaxed">Select how many people are joining</p>
                        </div>

                        <div className="flex items-center justify-center gap-3 md:gap-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-2xl border border-white/20">
                            <button
                                onClick={() => setNumberOfTravelers(Math.max(1, numberOfTravelers - 1))}
                                className="group w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                                disabled={numberOfTravelers <= 1}
                            >
                                <Minus className="w-5 h-5 text-neutral-700 group-hover:text-neutral-900 transition-colors" />
                            </button>

                            <div className="flex-1 max-w-[120px] text-center px-3">
                                <div className="text-3xl md:text-4xl font-black bg-gradient-to-br from-primary-600 to-accent-600 bg-clip-text text-transparent">
                                    {numberOfTravelers}
                                </div>
                                <div className="text-xs md:text-sm text-neutral-600 font-semibold">
                                    {numberOfTravelers === 1 ? 'Traveler' : 'Travelers'}
                                </div>
                            </div>

                            <button
                                onClick={() => setNumberOfTravelers(Math.min(10, numberOfTravelers + 1))}
                                className="group w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-2xl"
                                disabled={numberOfTravelers >= 10}
                            >
                                <Plus className="w-5 h-5 text-white transition-transform group-hover:rotate-90 duration-300" />
                            </button>
                        </div>
                    </div>

                    {/* Traveler Details */}
                    <div className="space-y-6 md:space-y-8">
                        <div className="flex items-center gap-4 px-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-lg">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">Traveler Details</h3>
                                <p className="text-neutral-600 text-sm md:text-base mt-0.5">Provide information for each traveler</p>
                            </div>
                        </div>

                        {travelers.map((traveler, index) => (
                            <div key={index} className="group relative bg-white rounded-[2rem] p-6 md:p-8 border-2 border-neutral-100 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 space-y-5 md:space-y-6 hover:border-primary-200">
                                {/* Subtle gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-accent-50/0 group-hover:from-primary-50/30 group-hover:to-accent-50/30 rounded-[2rem] transition-all duration-500 pointer-events-none"></div>

                                <div className="relative flex items-center justify-between pb-4 border-b border-neutral-200">
                                    <h4 className="text-lg md:text-xl font-black text-neutral-900 flex items-center gap-3">
                                        <span className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white text-sm md:text-base font-black shadow-lg">
                                            {index + 1}
                                        </span>
                                        <span>Traveler {index + 1}</span>
                                    </h4>
                                    {index === 0 && (
                                        <span className="text-[10px] md:text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-accent-600 px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                                            Lead
                                        </span>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                                    <div>
                                        <label className="block text-sm md:text-base font-bold text-neutral-800 mb-3">Full Name *</label>
                                        <Input
                                            value={traveler.name}
                                            onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                                            placeholder="Enter full name as per ID"
                                            className="w-full px-5 py-4 text-base border-2 border-neutral-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm md:text-base font-bold text-neutral-800 mb-3">Age *</label>
                                        <Input
                                            type="number"
                                            value={traveler.age || ''}
                                            onChange={(e) => updateTraveler(index, 'age', parseInt(e.target.value) || 0)}
                                            placeholder="Age in years"
                                            min="1"
                                            max="120"
                                            className="w-full px-5 py-4 text-base border-2 border-neutral-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm md:text-base font-bold text-neutral-800 mb-3">Gender *</label>
                                    <div className="relative">
                                        <select
                                            value={traveler.gender}
                                            onChange={(e) => updateTraveler(index, 'gender', e.target.value as 'male' | 'female' | 'other')}
                                            className="appearance-none w-full px-5 py-4 text-base border-2 border-neutral-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all bg-white font-semibold text-neutral-900 cursor-pointer hover:border-neutral-300"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm md:text-base font-bold text-neutral-800 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
                                            Emergency Contact Number *
                                        </div>
                                    </label>
                                    <PhoneInput
                                        value={traveler.emergencyContact}
                                        onChange={(phone, countryCode) => {
                                            updateTraveler(index, 'emergencyContact', phone)
                                            updateTraveler(index, 'emergencyContactCountry', countryCode)
                                        }}
                                        placeholder="Enter emergency contact"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-[2rem] p-6 md:p-10 border-2 border-green-200/80 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">Price Summary</h3>
                        </div>
                        <div className="space-y-4 md:space-y-5">
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-neutral-700 font-medium">Base Price ({numberOfTravelers} × ₹{journey.basePrice.toLocaleString()})</span>
                                <span className="font-bold text-neutral-900 text-base md:text-lg">₹{(journey.basePrice * numberOfTravelers).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-neutral-700 font-medium">Taxes & Fees (18% GST)</span>
                                <span className="font-bold text-neutral-900 text-base md:text-lg">₹{(journey.basePrice * numberOfTravelers * 0.18).toLocaleString()}</span>
                            </div>
                            <div className="h-0.5 bg-gradient-to-r from-transparent via-green-300 to-transparent my-4"></div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-black text-neutral-900 text-lg md:text-xl">Total Amount</span>
                                <span className="font-black bg-gradient-to-br from-primary-600 to-accent-600 bg-clip-text text-transparent text-2xl md:text-3xl">
                                    ₹{(journey.basePrice * numberOfTravelers * 1.18).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-10 mt-6 border-t border-neutral-100 flex items-center justify-end">
                        <button
                            onClick={handleNext}
                            className="group relative inline-flex items-center justify-center px-8 md:px-12 py-4 md:py-5 font-black text-white transition-all duration-300 bg-neutral-900 rounded-full hover:bg-neutral-800 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-neutral-200 w-full md:w-auto overflow-hidden active:scale-95"
                        >
                            {/* Animated Background Shine */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>

                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 group-hover:from-primary-900 group-hover:via-neutral-900 group-hover:to-primary-900 transition-colors duration-500"></div>

                            <span className="relative z-20 flex items-center gap-3 text-lg md:text-xl tracking-tight">
                                Continue to Review
                                <div className="bg-white/10 md:bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
                                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </span>
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
