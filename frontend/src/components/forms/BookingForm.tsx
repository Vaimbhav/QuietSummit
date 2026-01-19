import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Users, FileText, CreditCard } from 'lucide-react'
import { Journey } from '../../types/journey'
import TravelerInfoStep from './BookingSteps/TravelerInfoStep'
import ReviewStep from './BookingSteps/ReviewStep'
import PaymentStep from './BookingSteps/PaymentStep'

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
    basePrice: number
    addOnsTotal: number
    taxes: number
    couponCode?: string
    discount?: number
    couponDetails?: {
        couponId: string
        code: string
        discount: number
    }
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
    { id: 3, name: 'Payment', component: PaymentStep, icon: CreditCard },
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
                        basePrice: journey.basePrice,
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
        numberOfTravelers: 1,
        travelers: [],
        roomPreference: 'double',
        addOns: [],
        specialRequests: '',
        basePrice: journey.basePrice,
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
            basePrice: journey.basePrice,
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
                    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-luxury rounded-4xl shadow-luxury-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative my-8 border-luxury"
                        >
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors z-10 bg-white shadow-md"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Progress Bar */}
                            <div className="px-6 md:px-10 pt-8 pb-8 bg-white/80 backdrop-blur-xl border-b border-neutral-100 sticky top-0 z-20">
                                <div className="mb-8 text-center md:text-left">
                                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-2 tracking-tight">
                                        Book Your Journey
                                    </h2>
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-neutral-600 text-sm md:text-base flex-wrap">
                                        <span className="font-bold text-primary-600">{journey.title}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 hidden md:block"></span>
                                        <span className="hidden md:block">{journey.destination}</span>
                                    </div>
                                </div>

                                {/* Steps indicator */}
                                <div className="flex items-center justify-between max-w-2xl mx-auto md:mx-0">
                                    {steps.map((step, index) => {
                                        const StepIcon = step.icon
                                        return (
                                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                                <div className="flex flex-col items-center relative z-10 w-full md:w-auto">
                                                    <div
                                                        className={`w-10 h-10 md:w-14 md:h-14 rounded-full md:rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 ${currentStep > step.id
                                                            ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-200 scale-100'
                                                            : currentStep === step.id
                                                                ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white ring-4 ring-primary-100 shadow-xl shadow-primary-200 scale-110'
                                                                : 'bg-white border-2 border-neutral-200 text-neutral-400'
                                                            }`}
                                                    >
                                                        {currentStep > step.id ? (
                                                            <Check className="w-5 h-5 md:w-6 md:h-6" />
                                                        ) : (
                                                            <StepIcon className="w-5 h-5 md:w-6 md:h-6" />
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] md:text-xs font-bold mt-2 tracking-wide uppercase transition-colors duration-300 ${currentStep === step.id ? 'text-primary-600' : 'text-neutral-400'
                                                        }`}>
                                                        {step.name}
                                                    </span>
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className="flex-1 mx-2 md:mx-4 h-1 rounded-full bg-neutral-100 overflow-hidden relative">
                                                        <div
                                                            className={`absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 transition-transform duration-500 origin-left ${currentStep > step.id ? 'scale-x-100' : 'scale-x-0'
                                                                }`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Step Content */}
                            <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
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
