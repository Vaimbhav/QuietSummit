import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Clock, FileText, Info, ShieldCheck, ShoppingBag, Loader2, CheckCircle, Check } from 'lucide-react'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'
import { createRazorpayOrder, verifyPayment, createBooking, getRazorpayKey } from '../../../services/api'
import { useNavigate } from 'react-router-dom'

interface ReviewStepProps {
    journey: Journey
    bookingData: Partial<BookingData>
    onBack: () => void
    onClose: () => void
    onNext: (data: Partial<BookingData>) => void
}

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function ReviewStep({ journey, bookingData, onBack, onClose, onNext }: ReviewStepProps) {
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [bookingReference, setBookingReference] = useState('')

    // Default to full payment if not set
    const paymentType = bookingData.paymentType || 'full';

    const handlePaymentTypeChange = (type: 'full' | 'registration') => {
        // Calculate new total amount based on type
        // Note: Logic should match backend or consistent calculation
        // But here we rely on journey prices

        let newTotal = 0;
        const discount = bookingData.discount || 0;

        if (type === 'registration' && journey.registrationPrice) {
            // Registration fee is flat per person? Or fixed? 
            // Usually per person. 
            // The prompt says "registration amount is not refunded it is one time payment".
            // Assuming per person.
            newTotal = journey.registrationPrice * (bookingData.numberOfTravelers || 1);
            // No tax on registration? Or tax included? Let's assume registrationPrice is inclusive or simple.
            // For now, let's keep it simple: just the registration price.
        } else {
            newTotal = (bookingData.price || 0); // bookingData.price holds the total base fare
            // Add taxes
            const taxes = newTotal * 0.18; // 18% GST as per existing code
            // Add addons
            const addons = bookingData.addOnsTotal || 0;
            newTotal = newTotal + taxes + addons - discount;
        }

        onNext({
            paymentType: type,
            // We might update totalAmount here or let the parent do it. 
            // But BookingForm doesn't have calc logic.
            // We should update it here for consistency in submission.
            totalAmount: newTotal
        });
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true)
                return
            }
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }


    const handlePayment = async () => {
        setIsProcessing(true)

        try {
            // Validate booking data
            if (!bookingData.email || !bookingData.travelers?.[0]?.name) {
                alert('Please complete all required fields before payment.')
                setIsProcessing(false)
                return
            }

            if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
                alert('Invalid booking amount.')
                setIsProcessing(false)
                return
            }

            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                alert('Failed to load payment gateway. Please try again.')
                setIsProcessing(false)
                return
            }

            // Get Razorpay key from backend
            const keyResponse = await getRazorpayKey()
            const razorpayKey = keyResponse.data.key

            if (!razorpayKey) {
                alert('Payment gateway not configured. Please contact support.')
                setIsProcessing(false)
                return
            }

            // Create Razorpay order
            const orderResponse = await createRazorpayOrder({
                amount: bookingData.totalAmount || 0,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: {
                    journeyTitle: journey.title,
                    email: bookingData.email || '',
                },
            })

            const { orderId, amount, currency } = orderResponse.data

            // Format contact number - remove country code and spaces
            const rawContact = bookingData.travelers?.[0]?.emergencyContact || ''
            const formattedContact = rawContact.replace(/\D/g, '').slice(-10)

            // Razorpay options
            const options = {
                key: razorpayKey,
                amount: amount,
                currency: currency,
                name: 'QuietSummit',
                description: `${journey.title} - ${bookingData.numberOfTravelers} traveler(s)`,
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })

                        // Create booking
                        const bookingResponse = await createBooking({
                            ...bookingData,
                            journeyId: journey._id,
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        })

                        const bookingId = bookingResponse.data?.bookingId || bookingResponse.bookingId

                        // Clear session storage on success
                        sessionStorage.removeItem(`booking_${journey._id}`)

                        // Update state to show success screen
                        setBookingReference(bookingId)
                        setIsSuccess(true)
                        setIsProcessing(false)

                        const confirmationUrl = `/booking-confirmation/${bookingId}`;

                        // Delay navigation to show success message and ensure smooth transition
                        setTimeout(() => {
                            // Use React Router for all platforms to prevent page refresh crashes
                            navigate(confirmationUrl, { replace: true });
                            if (onClose) onClose();
                        }, 2000);

                    } catch (error) {
                        console.error('✗ Booking creation failed:', error)
                        setIsProcessing(false)
                        alert('Payment successful but booking creation failed. Please contact support with your payment ID: ' + response.razorpay_payment_id)
                    }
                },
                prefill: {
                    name: bookingData.travelers?.[0]?.name || '',
                    email: bookingData.email || '',
                    contact: formattedContact || '',
                },
                notes: {
                    journey: journey.title,
                    travelers: bookingData.numberOfTravelers,
                },
                theme: {
                    color: '#15803d', // green-700
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false)
                    },
                    escape: true,
                    backdropclose: false,
                }
            }

            const razorpay = new window.Razorpay(options)

            razorpay.on('payment.failed', function (response: any) {
                console.error('Payment failed:', response)
                console.error('Error details:', response.error)
                const errorMsg = response.error?.description || 'Payment failed. Please try again.'
                alert(errorMsg)
                setIsProcessing(false)
            })

            razorpay.open()
        } catch (error: any) {
            console.error('Payment error:', error)
            alert('Failed to initiate payment. Please try again.')
            setIsProcessing(false)
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'To be decided'
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                <h3 className="text-3xl font-black text-neutral-900 mb-4">
                    Booking Confirmed! 🎉
                </h3>
                <p className="text-lg text-neutral-600 mb-2">
                    Your journey to {journey.destination} is confirmed
                </p>
                {bookingReference && (
                    <div className="inline-block px-6 py-3 bg-primary-50 rounded-xl mb-6">
                        <p className="text-sm text-neutral-600">Booking Reference</p>
                        <p className="text-2xl font-black text-primary-600">{bookingReference}</p>
                    </div>
                )}
                <p className="text-neutral-600">
                    A confirmation email has been sent to {bookingData.email}
                </p>
                <div className="mt-8 flex items-center gap-2 text-neutral-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm">Redirecting to confirmation page...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-neutral-50/50">
            <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto pb-2"> {/* Reduced padding for better spacing with footer */}
                {/* Header Info */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="font-bold text-neutral-900 text-sm">Journey Start</p>
                            <p className="text-xs text-neutral-500">{formatDate(bookingData.departureDate)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-neutral-900 text-sm">{typeof journey.duration === 'number' ? `${journey.duration} Days` : `${journey.duration.days} Days`}</p>
                        <p className="text-xs text-neutral-500">Duration</p>
                    </div>
                </div>

                {/* Journey Item Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
                    <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-neutral-200 overflow-hidden shrink-0">
                            <img
                                src={journey.images[0] || '/images/placeholder.jpg'}
                                alt={journey.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-neutral-900 text-sm truncate">{journey.title}</h3>
                            <p className="text-xs text-neutral-500 mt-0.5 mb-2 truncate">{journey.destination}</p>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-neutral-900">{formatCurrency(journey.price)}</p>
                                    <p className="text-xs text-neutral-400">per person</p>
                                </div>

                                <div className="flex items-center gap-2 bg-green-50 px-2 py-1.5 rounded-lg border border-green-100">
                                    <span className="text-xs font-bold text-green-700 whitespace-nowrap">
                                        {bookingData.numberOfTravelers} Travelers
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Travelers Details (Condensed) */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
                    <h4 className="font-bold text-neutral-900 text-sm mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-neutral-400" />
                        Travelers Details
                    </h4>
                    <div className="space-y-2">
                        {bookingData.travelers?.map((traveler, index) => (
                            <div key={index} className="flex justify-between items-center text-xs border-b border-neutral-50 last:border-0 pb-2 last:pb-0">
                                <span className="text-neutral-600 font-medium">{index + 1}. {traveler.name}</span>
                                <span className="text-neutral-400">{traveler.age} yrs • {traveler.gender}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Options */}
                {journey.registrationPrice && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
                        <h4 className="font-bold text-neutral-900 text-sm mb-3">Payment Option</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handlePaymentTypeChange('full')}
                                className={`p-3 rounded-xl border text-left transition-all relative ${paymentType === 'full'
                                    ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                                    : 'border-neutral-200 hover:border-neutral-300'
                                    }`}
                            >
                                {paymentType === 'full' && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="font-bold text-sm text-neutral-900">Pay Full Amount</div>
                                <div className="text-xs text-neutral-500 mt-1">Complete your booking</div>
                            </button>

                            <button
                                onClick={() => handlePaymentTypeChange('registration')}
                                className={`p-3 rounded-xl border text-left transition-all relative ${paymentType === 'registration'
                                    ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                                    : 'border-neutral-200 hover:border-neutral-300'
                                    }`}
                            >
                                {paymentType === 'registration' && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div className="font-bold text-sm text-neutral-900">Registration Only</div>
                                <div className="text-xs text-neutral-500 mt-1">Pay rest on departure</div>
                            </button>
                        </div>
                        {paymentType === 'registration' && (
                            <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-2">
                                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    <strong>Note:</strong> Registration fee is non-refundable. The remaining balance will be collected upon arrival.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Bill Details */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
                    <h4 className="font-bold text-neutral-900 text-sm mb-3">Bill details</h4>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-600 flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                Base Fare
                            </span>
                            <span className="text-neutral-900 font-medium">{formatCurrency(bookingData.price || 0)}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-600 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Taxes & Fees (18% GST)
                            </span>
                            <span className="text-neutral-900 font-medium">{formatCurrency(bookingData.taxes || 0)}</span>
                        </div>

                        {bookingData.discount && bookingData.discount > 0 && (
                            <div className="flex justify-between items-center text-xs text-green-600">
                                <span className="flex items-center gap-1 font-medium">
                                    Coupon Discount
                                </span>
                                <span className="font-bold">-{formatCurrency(bookingData.discount)}</span>
                            </div>
                        )}

                        <div className="h-px bg-neutral-100 my-1"></div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-neutral-900">
                                {paymentType === 'registration' ? 'Payable Now' : 'Grand total'}
                            </span>
                            <span className="font-bold text-neutral-900">{formatCurrency(bookingData.totalAmount || 0)}</span>
                        </div>
                        {paymentType === 'registration' && (
                            <div className="flex justify-between items-center text-xs text-neutral-500 mt-1">
                                <span>Balance due later</span>
                                <span>
                                    {formatCurrency(
                                        ((bookingData.price || 0) + (bookingData.taxes || 0) + (bookingData.addOnsTotal || 0) - (bookingData.discount || 0)) - (bookingData.totalAmount || 0)
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-4">
                    <h4 className="font-bold text-neutral-900 text-sm mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-neutral-400" />
                        Cancellation Policy
                    </h4>
                    <p className="text-xs text-neutral-500 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                        Trip bookings can be cancelled subject to terms. The full booking amount will be refunded upon cancellation, except for the registration fee which is non-refundable.
                    </p>
                </div>
            </div>

            {/* Bottom Action Bar - Fixed Bottom Position */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 pb-8 border-t border-neutral-100 sticky bottom-0 left-0 right-0 z-[100] w-full mt-auto shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">

                {/* Mobile Layout */}
                <div className="flex md:hidden items-center gap-4 max-w-md mx-auto">
                    <button
                        onClick={onBack}
                        disabled={isProcessing}
                        className="w-14 h-14 rounded-full border border-neutral-200 bg-white text-neutral-600 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-95 flex-shrink-0 shadow-sm"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="flex-1 group relative overflow-hidden bg-primary-600 text-white h-14 rounded-full flex items-center justify-between px-2 pl-6 pr-2 transition-all shadow-[0_8px_30px_rgba(58,111,90,0.3)] hover:shadow-[0_8px_35px_rgba(58,111,90,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 opacity-100"></div>

                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shine"></div>

                        <div className="flex flex-col items-start leading-none relative z-10">
                            <span className="text-[10px] text-primary-100 font-medium tracking-wider uppercase mb-0.5">Total Pay</span>
                            <span className="text-xl font-bold tracking-tight">{formatCurrency(bookingData.totalAmount || 0)}</span>
                        </div>

                        <div className="h-10 px-6 rounded-full bg-white text-primary-700 flex items-center gap-2 font-bold text-sm shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-300">
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Pay Now <ChevronRight className="w-4 h-4 text-primary-600" strokeWidth={3} />
                                </>
                            )}
                        </div>
                    </button>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between w-full">
                    <button
                        onClick={onBack}
                        disabled={isProcessing}
                        className="w-12 h-12 rounded-full border border-neutral-200 bg-white text-neutral-600 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-6 bg-primary-900 rounded-2xl p-2 pr-2 pl-6 shadow-luxury">
                        <div className="text-right">
                            <p className="text-[10px] text-primary-200 font-bold uppercase tracking-wider mb-0.5">Total Pay</p>
                            <p className="text-xl font-black text-white">{formatCurrency(bookingData.totalAmount || 0)}</p>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="bg-white text-primary-800 font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Pay Now <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
