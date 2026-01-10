import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Journey } from '../../types/journey'
import TripDetailsStep from './BookingSteps/TripDetailsStep'
import TravelerInfoStep from './BookingSteps/TravelerInfoStep'
import AddOnsStep from './BookingSteps/AddOnsStep'
import ReviewStep from './BookingSteps/ReviewStep'
import PaymentStep from './BookingSteps/PaymentStep'
import { useNavigate, useLocation } from 'react-router-dom'

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
}

const steps = [
    { id: 1, name: 'Trip Details', component: TripDetailsStep },
    { id: 2, name: 'Travelers', component: TravelerInfoStep },
    { id: 3, name: 'Add-Ons', component: AddOnsStep },
    { id: 4, name: 'Review', component: ReviewStep },
    { id: 5, name: 'Payment', component: PaymentStep },
]

export default function BookingForm({ journey, isOpen, onClose }: BookingFormProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const [currentStep, setCurrentStep] = useState(1)
    const [bookingData, setBookingData] = useState<Partial<BookingData>>({
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
        setBookingData({ ...bookingData, ...data })
        if (currentStep < steps.length) {
            const nextStep = currentStep + 1
            setCurrentStep(nextStep)
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
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-hidden"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative my-8"
                        >
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors z-10 bg-white shadow-md"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Progress Bar */}
                            <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-primary-50 to-accent-50">
                                <h2 className="text-3xl font-black text-neutral-900 mb-2">
                                    Book Your Journey
                                </h2>
                                <p className="text-neutral-600 mb-6">
                                    {journey.title} • {journey.destination}
                                </p>

                                {/* Steps indicator */}
                                <div className="flex items-center justify-between">
                                    {steps.map((step, index) => (
                                        <div key={step.id} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center relative">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep > step.id
                                                        ? 'bg-primary-600 text-white'
                                                        : currentStep === step.id
                                                            ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                                                            : 'bg-neutral-200 text-neutral-500'
                                                        }`}
                                                >
                                                    {currentStep > step.id ? (
                                                        <Check className="w-5 h-5" />
                                                    ) : (
                                                        step.id
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium mt-2 text-neutral-700 hidden md:block">
                                                    {step.name}
                                                </span>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div
                                                    className={`flex-1 h-1 mx-2 rounded transition-all ${currentStep > step.id
                                                        ? 'bg-primary-600'
                                                        : 'bg-neutral-200'
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    ))}
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
