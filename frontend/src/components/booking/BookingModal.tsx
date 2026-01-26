import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Property } from '../../services/propertyApi';
import { createPropertyBooking } from '../../services/bookingApi';
import BookingProgressBar from './BookingProgressBar';
import GuestInformationForm from './GuestInformationForm';
import SpecialRequestsForm from './SpecialRequestsForm';
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

    const steps = ['Guest Info', 'Special Requests', 'Review & Confirm'];

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleNext = () => {
        if (currentStep < 3) {
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

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone: string) => {
        const digits = phone.replace(/\D/g, '');
        return /^[\d\s\-\+\(\)]+$/.test(phone) && digits.length >= 10 && digits.length <= 13;
    };

    const validateStep = () => {
        if (currentStep === 1) {
            const { primaryGuest } = bookingData;
            if (!primaryGuest.name || !primaryGuest.email || !primaryGuest.phone || !primaryGuest.country) {
                setError('Please fill in all required fields for the primary guest');
                return false;
            }

            if (!validateEmail(primaryGuest.email)) {
                setError('Please enter a valid email address');
                return false;
            }

            if (!validatePhone(primaryGuest.phone)) {
                setError('Please enter a valid phone number (10-13 digits)');
                return false;
            }

            // Validate additional guests
            for (let i = 0; i < bookingData.additionalGuests.length; i++) {
                const guest = bookingData.additionalGuests[i];
                if (!guest.name || !guest.age) {
                    setError(`Please fill in all required fields for Guest ${i + 2}`);
                    return false;
                }
            }
        }
        setError(null);
        return true;
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Premium Blurred Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-all duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-br from-primary-50 via-white to-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-1">Complete Your Booking</h2>
                            <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                {property.title}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <BookingProgressBar currentStep={currentStep} steps={steps} />

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl animate-shake">
                                <p className="text-sm text-red-800 font-semibold">{error}</p>
                            </div>
                        )}

                        {/* Step Content */}
                        <div className="animate-fade-in">
                            {currentStep === 1 && (
                                <GuestInformationForm
                                    guests={guests}
                                    primaryGuest={bookingData.primaryGuest}
                                    additionalGuests={bookingData.additionalGuests}
                                    onUpdate={(data) =>
                                        setBookingData({
                                            ...bookingData,
                                            primaryGuest: data.primaryGuest,
                                            additionalGuests: data.additionalGuests,
                                        })
                                    }
                                />
                            )}

                            {currentStep === 2 && (
                                <SpecialRequestsForm
                                    specialRequests={bookingData.specialRequests}
                                    onUpdate={(data) =>
                                        setBookingData({
                                            ...bookingData,
                                            specialRequests: data,
                                        })
                                    }
                                />
                            )}

                            {currentStep === 3 && (
                                <BookingReview
                                    property={property}
                                    checkIn={checkIn}
                                    checkOut={checkOut}
                                    guests={guests}
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
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100 px-8 py-6 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-2xl font-semibold transition-colors border border-gray-200"
                                >
                                    ← Back
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Total Amount</p>
                                <p className="text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">₹{priceBreakdown.totalPrice.toLocaleString()}</p>
                            </div>

                            {currentStep < 3 ? (
                                <button
                                    onClick={() => {
                                        if (validateStep()) {
                                            handleNext();
                                        }
                                    }}
                                    className="px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={loading || !acceptedTerms || !acceptedCancellation}
                                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2.5"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            ✓ Confirm Booking
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
