import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Users, FileText } from 'lucide-react'
import { Journey } from '../../types/journey'
import TravelerInfoStep from './BookingSteps/TravelerInfoStep'
import ReviewStep from './BookingSteps/ReviewStep'

interface BookingFormProps {
    journey: Journey
    isOpen: boolean
    onClose: () => void
}

export interface BookingData {
    email: string
    journeyId: string
    departureDate: string
    numberOfTravelers: number
    travelers: Array<{
        name: string
        age: number
        gender: 'male' | 'female' | 'other'
        emergencyContact?: string
    }>
    roomPreference: 'single' | 'double' | 'triple'
    addOns: string[]
    specialRequests: string
    totalAmount: number
    price: number
    addOnsTotal: number
    taxes: number
    couponCode?: string
    discount?: number
    couponDetails?: {
        couponId: string
        code: string
        discount: number
    }
    paymentType?: 'full' | 'registration'
    // Razorpay payment fields
    paymentId?: string
    orderId?: string
    razorpay_payment_id?: string
    razorpay_order_id?: string
    razorpay_signature?: string
}

const steps = [
    { id: 1, name: 'Travelers', component: TravelerInfoStep, icon: Users },
    { id: 2, name: 'Review', component: ReviewStep, icon: FileText },
]

export default function BookingForm({ journey, isOpen, onClose }: BookingFormProps) {
    // Restore booking state from sessionStorage on mount
    const getInitialState = () => {
        const saved = sessionStorage.getItem(`booking_${journey._id}`)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                return {
                    step: parsed.step || 1,
                    data: parsed.data || {
                        journeyId: journey._id,
                        numberOfTravelers: 1,
                        travelers: [],
                        roomPreference: 'double',
                        addOns: [],
                        specialRequests: '',
                        price: journey.price,
                    }
                }
            } catch {
                return { step: 1, data: null }
            }
        }
        return { step: 1, data: null }
    }

    const initialState = getInitialState()
    const [currentStep, setCurrentStep] = useState(initialState.step)
    const [bookingData, setBookingData] = useState<Partial<BookingData>>(initialState.data || {
        journeyId: journey._id,
        departureDate: journey.departureDate && !isNaN(new Date(journey.departureDate as any).getTime()) ? new Date(journey.departureDate).toISOString() : '',
        numberOfTravelers: 1,
        travelers: [],
        roomPreference: 'double',
        addOns: [],
        specialRequests: '',
        price: journey.price,
        paymentType: 'full'
    })

    const CurrentStepComponent = steps[currentStep - 1].component

    const handleNext = (data: Partial<BookingData>) => {
        const updatedData = { ...bookingData, ...data }
        setBookingData(updatedData)
        if (currentStep < steps.length) {
            const nextStep = currentStep + 1
            setCurrentStep(nextStep)
            // Save state to sessionStorage
            sessionStorage.setItem(`booking_${journey._id}`, JSON.stringify({
                step: nextStep,
                data: updatedData
            }))
            // Push new history entry for next step
            window.history.pushState({ step: nextStep }, '')
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            // Use browser back to maintain history
            window.history.back()
        } else {
            handleClose()
        }
    }

    const handleClose = () => {
        // Clear sessionStorage for this booking
        sessionStorage.removeItem(`booking_${journey._id}`)

        // Reset state
        setCurrentStep(1)
        setBookingData({
            journeyId: journey._id,
            numberOfTravelers: 1,
            travelers: [],
            roomPreference: 'double',
            addOns: [],
            specialRequests: '',
            price: journey.price,
        })

        // Close modal
        onClose()
    }

    // Handle browser back/forward button
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (isOpen) {
                if (event.state?.step) {
                    // Navigate to the step from history
                    setCurrentStep(event.state.step)
                } else {
                    // If no step in state, close the modal
                    handleClose()
                }
            }
        }

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [isOpen])

    // Initialize history state when modal opens
    useEffect(() => {
        if (isOpen) {
            // Push initial state for step 1
            window.history.pushState({ step: 1 }, '')
        }
    }, [isOpen])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.width = '100%'
        } else {
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.width = ''
        }
        return () => {
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.width = ''
        }
    }, [isOpen])

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose()
            }
        }

        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, currentStep])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] overflow-hidden"
                        onClick={(e) => {
                            // Only close if clicking backdrop directly
                            if (e.target === e.currentTarget) {
                                handleClose()
                            }
                        }}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-3 sm:p-4 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-3xl shadow-2xl max-w-3xl w-full h-[95vh] sm:h-[90vh] overflow-hidden relative flex flex-col border"
                            style={{
                                background: 'linear-gradient(165deg, #0b1224 0%, #0f172a 40%, #0c1325 100%)',
                                backdropFilter: 'blur(16px)',
                                borderColor: 'rgba(92, 225, 230, 0.25)'
                            }}
                        >
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-3 right-3 p-2 rounded-full transition-colors z-10"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                                aria-label="Close booking form"
                            >
                                <X className="w-5 h-5 text-slate-200" />
                            </button>

                            {/* Progress Bar */}
                            <div className="px-5 md:px-7 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(92,225,230,0.22)' }}>
                                <div className="mb-4 text-center">
                                    <h2 className="text-xl md:text-2xl font-black text-white mb-1">
                                        Book Your Journey
                                    </h2>
                                    <div className="flex items-center justify-center gap-1.5 text-slate-300 text-xs flex-wrap">
                                        <span className="font-semibold" style={{ color: '#5CE1E6' }}>{journey.title}</span>
                                    </div>
                                </div>

                                {/* Steps indicator */}
                                <div className="max-w-xl mx-auto rounded-2xl p-2 sm:p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-center justify-between">
                                        {steps.map((step, index) => {
                                            const StepIcon = step.icon
                                            return (
                                                <div key={step.id} className={`flex items-center ${index === steps.length - 1 ? 'flex-none' : 'flex-1'}`}>
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <div
                                                            className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300`}
                                                            style={{
                                                                background: currentStep >= step.id ? '#5CE1E6' : 'rgba(255,255,255,0.07)',
                                                                color: currentStep >= step.id ? '#0b1224' : '#9ca3af',
                                                                border: currentStep === step.id ? '2px solid rgba(92,225,230,0.8)' : '1px solid rgba(255,255,255,0.08)'
                                                            }}
                                                        >
                                                            {currentStep > step.id ? (
                                                                <Check className="w-4 h-4" />
                                                            ) : (
                                                                <StepIcon className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <span className={`text-xs font-bold uppercase transition-colors duration-300`}
                                                            style={{ color: currentStep === step.id ? '#5CE1E6' : '#9ca3af' }}>
                                                            {step.name}
                                                        </span>
                                                    </div>
                                                    {index < steps.length - 1 && (
                                                        <div className="flex-1 mx-4 h-0.5 rounded-full overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                            <div
                                                                className={`absolute inset-0 transition-transform duration-300 origin-left`}
                                                                style={{
                                                                    background: 'linear-gradient(90deg, #5CE1E6 0%, #38bdf8 100%)',
                                                                    transform: currentStep > step.id ? 'scaleX(1)' : 'scaleX(0)'
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CurrentStepComponent
                                            journey={journey}
                                            bookingData={bookingData}
                                            onNext={handleNext}
                                            onBack={handleBack}
                                            onClose={handleClose}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
