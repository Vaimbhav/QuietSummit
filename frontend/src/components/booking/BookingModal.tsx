import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property } from '../../services/propertyApi';
import { createPropertyBooking } from '../../services/bookingApi';
import BookingProgressBar from './BookingProgressBar';
import GuestInformationForm from './GuestInformationForm';
import BookingReview from './BookingReview';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
    checkIn: string;
    checkOut: string;
    guests: number;
    priceBreakdown: {
        basePrice: number;
        cleaningFee: number;
        totalPrice: number;
        nights: number;
    };
}

export default function BookingModal({
    isOpen,
    onClose,
    property,
    checkIn,
    checkOut,
    guests,
    priceBreakdown,
}: BookingModalProps) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedCancellation, setAcceptedCancellation] = useState(false);

    // Get user data from localStorage
    const getUserData = () => {
        const userDataStr = localStorage.getItem('quietsummit_user');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                return {
                    name: userData.user?.name || userData.name || '',
                    email: userData.user?.email || userData.email || '',
                    phone: userData.user?.phone || '',
                    country: 'India',
                };
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return { name: '', email: '', phone: '', country: 'India' };
    };

    const [bookingData, setBookingData] = useState({
        guests: guests,
        primaryGuest: getUserData(),
        additionalGuests: Array.from({ length: Math.max(0, guests - 1) }, () => ({
            name: '',
            age: 30,
        })),
        specialRequests: {
            arrivalTime: '',
            requests: '',
            tripPurpose: '',
        },
    });

    const steps = ['Guest Info', 'Review & Pay'];

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleNext = (stepData?: any) => {
        if (stepData) {
            setBookingData(prev => ({ ...prev, ...stepData }));
        }
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleEdit = (step: number) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConfirmBooking = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await createPropertyBooking({
                propertyId: property._id,
                checkIn,
                checkOut,
                guests,
                // Include special requests in the booking payload if the API supports it
                // specialRequests: bookingData.specialRequests 
            });

            // Success - redirect to confirmation page
            navigate(`/booking-confirmation/${response.data.booking._id}`);
        } catch (error: any) {
            console.error('Error creating booking:', error);
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to create booking. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

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
                                onClose();
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
                                onClick={onClose}
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
                                        Complete Your Booking
                                    </h2>
                                    <div className="flex items-center justify-center gap-1.5 text-slate-300 text-xs flex-wrap">
                                        <span className="font-semibold" style={{ color: '#5CE1E6' }}>{property.title}</span>
                                    </div>
                                </div>

                                {/* Steps indicator */}
                                <div className="max-w-xl mx-auto rounded-2xl p-2 sm:p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <BookingProgressBar currentStep={currentStep} steps={steps} />
                                </div>
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 overflow-y-auto">
                                {error && (
                                    <div className="mx-4 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-md text-center">
                                        <p className="text-sm font-semibold text-red-400">{error}</p>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <GuestInformationForm
                                        guests={bookingData.guests}
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        initialData={bookingData}
                                        onNext={handleNext}
                                        onBack={onClose}
                                    />
                                )}

                                {currentStep === 2 && (
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1 p-4 md:p-8 pb-20">
                                            <BookingReview
                                                property={property}
                                                checkIn={checkIn}
                                                checkOut={checkOut}
                                                guests={bookingData.guests}
                                                priceBreakdown={priceBreakdown}
                                                primaryGuest={bookingData.primaryGuest}
                                                additionalGuests={bookingData.additionalGuests}
                                                specialRequests={bookingData.specialRequests}
                                                onEdit={handleEdit}
                                                acceptedTerms={acceptedTerms}
                                                acceptedCancellation={acceptedCancellation}
                                                onTermsChange={setAcceptedTerms}
                                                onCancellationChange={setAcceptedCancellation}
                                            />
                                        </div>

                                        {/* Review Footer */}
                                        <div className="px-4 md:px-6 py-3.5 sticky bottom-0 left-0 right-0 z-[100] w-full mt-auto bg-[#0f172a]/95 backdrop-blur-xl border-t border-teal-500/10">
                                            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                                                <button
                                                    onClick={handleBack}
                                                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm border border-slate-600/50 hover:border-slate-500"
                                                >
                                                    <span className="text-lg">←</span> Back
                                                </button>

                                                <button
                                                    onClick={() => !loading && acceptedTerms && acceptedCancellation && handleConfirmBooking()}
                                                    disabled={loading || !acceptedTerms || !acceptedCancellation}
                                                    className={`
                                                        flex-1 max-w-md px-4 py-3 rounded-xl font-bold text-white shadow-xl transition-all text-lg
                                                        ${loading || !acceptedTerms || !acceptedCancellation
                                                            ? 'bg-slate-700 cursor-not-allowed opacity-50'
                                                            : 'bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 hover:shadow-teal-500/40 active:scale-[0.98]'
                                                        }
                                                    `}
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            <span className="text-base">Processing...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span>Pay</span>
                                                            <span>₹{priceBreakdown.totalPrice.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
