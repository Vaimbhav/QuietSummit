import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Minus, AlertCircle, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react'
import Button from '../../common/Button'
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
    onBack,
}: TravelerInfoStepProps) {
    const navigate = useNavigate()
    const { isAuthenticated, user: userData } = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showLoginRequired, setShowLoginRequired] = useState(false)
    const [numberOfTravelers, setNumberOfTravelers] = useState(bookingData.numberOfTravelers || 1)

    // Parse dates to handle object structure and seats
    const availableDates = (() => {
        if (!journey.departureDate || isNaN(new Date(journey.departureDate as any).getTime())) return [];
        const dateObj = new Date(journey.departureDate);

        const total = journey.totalSeats ?? 20;
        const booked = journey.bookedSeats ?? 0;

        return [{
            date: dateObj,
            total,
            booked,
            seatsLeft: total - booked,
            label: dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        }];
    })().filter(d => d.date > new Date());

    // Initial date index (find first available future date)
    const getInitialDateIndex = () => {
        const idx = availableDates.findIndex(d => d.date > new Date() && d.seatsLeft > 0)
        return idx !== -1 ? idx : 0
    }

    const [selectedDateIndex, setSelectedDateIndex] = useState(getInitialDateIndex())

    const selectedDeparture = availableDates[selectedDateIndex]

    // Use selected date, or empty string if no dates are defined (Registration Mode)
    // ONLY fallback to 7 days from now if dates exist but somehow aren't selected (edge case)
    const departureDate = selectedDeparture
        ? selectedDeparture.date.toISOString().split('T')[0]
        : (availableDates.length === 0 ? '' : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    useEffect(() => {
        if (!isAuthenticated) {
            const currentPath = window.location.pathname
            localStorage.setItem('redirectAfterLogin', currentPath)
            setShowLoginModal(true)
        }
    }, [isAuthenticated])

    const calculateAge = (dob: string | undefined | null) => {
        if (!dob) return ''
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age > 0 ? age : ''
    }

    const [travelers, setTravelers] = useState<Traveler[]>(
        bookingData.travelers && bookingData.travelers.length > 0
            ? bookingData.travelers.map(t => ({
                ...t,
                emergencyContact: t.emergencyContact || '',
            }))
            : Array.from({ length: numberOfTravelers }, (_, i) => ({
                name: i === 0 ? userData?.name || '' : '',
                age: (i === 0 && userData?.dateOfBirth) ? calculateAge(userData.dateOfBirth) : '',
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
                    age: '' as const,
                    gender: 'male' as const,
                    emergencyContact: '',
                }) as Traveler)
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

        // Validate seats
        if (selectedDeparture) {
            if (selectedDeparture.date < new Date()) {
                alert('This departure date matches a past date. Please select a future date.')
                return
            }
            if (numberOfTravelers > selectedDeparture.seatsLeft) {
                alert(`Not enough seats available. Only ${selectedDeparture.seatsLeft} seats remaining for this date.`)
                return
            }
        } else {
            // General seat check for TBD dates
            const total = journey.totalSeats ?? 20;
            const booked = journey.bookedSeats ?? 0;
            const remaining = total - booked;

            if (numberOfTravelers > remaining) {
                alert(`Not enough seats available. Only ${remaining} seats remaining.`)
                return
            }
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
        const calculatedBasePrice = journey.price * numberOfTravelers
        const taxes = calculatedBasePrice * 0.18
        const totalAmount = calculatedBasePrice + taxes

        const sanitizedTravelers = travelers.map(t => ({
            ...t,
            age: Number(t.age)
        }))

        onNext({
            numberOfTravelers,
            travelers: sanitizedTravelers,
            departureDate,
            email: userData?.email || '',
            price: calculatedBasePrice,
            addOnsTotal: 0,
            taxes,
            totalAmount,
            addOns: [],
            specialRequests: '',
            roomPreference: 'double',
        })
    }

    return (
        <div className="flex flex-col h-full" style={{ background: '#0b1224' }}>
            <div className="flex-1 p-3 md:p-4 space-y-3 overflow-y-auto pb-6">
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
                        {/* Departure Date Selection */}
                        <div className="rounded-xl p-4 md:p-6 space-y-4" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-full bg-teal-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                                </div>
                                <h3 className="text-sm sm:text-base font-semibold text-slate-200">Trip Schedule</h3>
                            </div>

                            {availableDates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Departure Date</label>
                                        <div className="relative group/select">
                                            <select
                                                value={selectedDateIndex}
                                                onChange={(e) => setSelectedDateIndex(Number(e.target.value))}
                                                className="appearance-none w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                                            >
                                                {availableDates.map((d, idx) => {
                                                    const isPast = d.date < new Date()
                                                    const isFull = d.seatsLeft <= 0
                                                    return (
                                                        <option key={idx} value={idx} disabled={isPast || isFull} className="bg-slate-900 text-white">
                                                            {d.label} {isPast ? '(Past)' : isFull ? '(Full)' : `(${d.seatsLeft} seats left)`}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg p-3 flex items-start gap-4 bg-teal-500/5 border border-teal-500/20">
                                    <div className="p-2 rounded-lg mt-0.5 bg-teal-500/10 shrink-0">
                                        <AlertCircle className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Registration Only</p>
                                        <p className="text-xs mt-1 leading-relaxed text-slate-400">
                                            Register now to join the interest pool. We will coordinate the final departure date.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Number of Travelers */}
                        <div className="rounded-xl p-4 md:p-6 space-y-4" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-teal-500/10">
                                        <Users className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-200">Total Travelers</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Who is joining you?</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white/5 px-2 py-1.5 rounded-lg border border-white/10">
                                    <button
                                        onClick={() => setNumberOfTravelers(Math.max(1, numberOfTravelers - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={numberOfTravelers <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    <div className="min-w-[32px] text-center">
                                        <span className="text-lg font-bold text-white">{numberOfTravelers}</span>
                                    </div>

                                    <button
                                        onClick={() => setNumberOfTravelers(Math.min(10, numberOfTravelers + 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-500 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={numberOfTravelers >= 10}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Traveler Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-200 px-1">Traveler Details</h3>

                            {travelers.map((traveler, index) => (
                                <div key={index} className="rounded-xl p-4 md:p-6 space-y-5" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <h4 className="text-sm font-bold flex items-center gap-3 text-slate-100">
                                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold ring-1 ring-teal-500/20">
                                                {index + 1}
                                            </span>
                                            Traveler Information
                                        </h4>
                                        {index === 0 && (
                                            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-teal-500 text-white tracking-wide shadow-lg shadow-teal-500/20">
                                                Lead Guest
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Name <span className="text-red-400">*</span></label>
                                            <input
                                                value={traveler.name}
                                                onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Age <span className="text-red-400">*</span></label>
                                                <input
                                                    type="number"
                                                    value={traveler.age}
                                                    onChange={(e) => updateTraveler(index, 'age', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                    placeholder="25"
                                                    min="1"
                                                    max="120"
                                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                                                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Gender <span className="text-red-400">*</span></label>
                                                <div className="relative group/select">
                                                    <select
                                                        value={traveler.gender}
                                                        onChange={(e) => updateTraveler(index, 'gender', e.target.value as 'male' | 'female' | 'other')}
                                                        className="appearance-none w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm cursor-pointer"
                                                        style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                                                    >
                                                        <option value="male" className="bg-slate-900">Male</option>
                                                        <option value="female" className="bg-slate-900">Female</option>
                                                        <option value="other" className="bg-slate-900">Other</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <PhoneInput
                                                value={traveler.emergencyContact}
                                                onChange={(phone, countryCode) => {
                                                    updateTraveler(index, 'emergencyContact', phone)
                                                    updateTraveler(index, 'emergencyContactCountry', countryCode)
                                                }}
                                                placeholder="Enter phone number"
                                                label="Phone Number"
                                                required
                                                darkMode={true}
                                            />
                                            <p className="text-[10px] text-slate-500 mt-1.5 ml-0.5">Enter without country code if possible</p>
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
                <div className="px-3 md:px-4 py-3 sticky bottom-0 left-0 right-0 z-[100] w-full mt-auto backdrop-blur-md"
                    style={{ background: 'rgba(15, 23, 42, 0.8)', borderTop: '1px solid rgba(92,225,230,0.1)' }}
                >
                    <div className="flex gap-3">
                        <button
                            onClick={onBack}
                            className="h-12 px-5 flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 active:scale-95 transition-all text-sm font-bold"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-teal-500/20 active:scale-[0.98] text-sm md:text-base group hover:shadow-teal-500/30 overflow-hidden relative"
                            style={{ background: 'linear-gradient(90deg, #2dd4bf 0%, #0d9488 100%)' }}
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></div>
                            <span className="relative z-10 flex items-center gap-2">
                                Continue
                                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
