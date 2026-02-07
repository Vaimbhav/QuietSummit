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
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-white">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle className="w-12 h-12 text-teal-400" />
                </motion.div>
                <h3 className="text-3xl font-black text-white mb-4">
                    Booking Confirmed! 🎉
                </h3>
                <p className="text-lg text-slate-300 mb-2">
                    Your journey to {journey.destination} is confirmed
                </p>
                {bookingReference && (
                    <div className="inline-block px-6 py-3 bg-white/5 rounded-xl mb-6 border border-white/10">
                        <p className="text-sm text-slate-400">Booking Reference</p>
                        <p className="text-2xl font-black text-teal-400">{bookingReference}</p>
                    </div>
                )}
                <p className="text-slate-400">
                    A confirmation email has been sent to {bookingData.email}
                </p>
                <div className="mt-8 flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm">Redirecting to confirmation page...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex-1 p-3 md:p-5 space-y-3 overflow-y-auto pb-6">
                {/* Header Info */}
                <div className="bg-white/5 rounded-2xl p-4 md:p-5 flex items-center justify-between backdrop-blur-md" 
                     style={{ border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/20">
                            <Clock className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-200 text-sm mb-0.5">Journey Start</p>
                            <p className="text-xs text-slate-400">{formatDate(bookingData.departureDate)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-200 text-sm mb-0.5">{typeof journey.duration === 'number' ? `${journey.duration} Days` : `${journey.duration.days} Days`}</p>
                        <p className="text-xs text-slate-400">Duration</p>
                    </div>
                </div>

                {/* Journey Item Card */}
                <div className="bg-white/5 rounded-2xl p-4 md:p-5 backdrop-blur-md" 
                     style={{ border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden shrink-0 ring-1 ring-white/10">
                            <img
                                src={journey.images[0] || '/images/placeholder.jpg'}
                                alt={journey.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="mb-2">
                                <h3 className="font-bold text-slate-100 text-sm md:text-base truncate leading-tight">{journey.title}</h3>
                                <p className="text-xs text-slate-400 mt-1 truncate">{journey.destination}</p>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <div>
                                    <p className="font-bold text-white text-base">{formatCurrency(journey.price)}</p>
                                    <p className="text-[10px] text-slate-400">per person</p>
                                </div>

                                <div className="flex items-center gap-1.5 bg-teal-500/10 px-2.5 py-1.5 rounded-lg border border-teal-500/20">
                                    <span className="text-xs font-bold text-teal-400 whitespace-nowrap">
                                        {bookingData.numberOfTravelers} Travelers
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Travelers Details */}
                <div className="bg-white/5 rounded-2xl p-4 md:p-5 backdrop-blur-md" 
                     style={{ border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h4 className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />
                        Travelers Details
                    </h4>
                    <div className="space-y-2">
                        {bookingData.travelers?.map((traveler, index) => (
                            <div key={index} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-slate-300 font-medium flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-700 text-[10px] flex items-center justify-center text-slate-300">{index + 1}</span>
                                    {traveler.name}
                                </span>
                                <span className="text-slate-400 bg-black/20 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase">
                                    {traveler.age} yrs • {traveler.gender}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Options */}
                <div className="bg-white/5 rounded-2xl p-4 md:p-5 backdrop-blur-md" 
                     style={{ border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h4 className="font-bold text-slate-200 text-sm mb-3">Payment Option</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handlePaymentTypeChange('full')}
                            className={`p-4 rounded-xl border text-left transition-all relative group ${paymentType === 'full'
                                ? 'border-teal-500/50 bg-teal-500/10 ring-1 ring-teal-500/30'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            {paymentType === 'full' && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#2dd4bf] rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 ring-2 ring-[#0f172a]">
                                    <Check className="w-3 h-3 text-[#0f172a]" strokeWidth={3.5} />
                                </div>
                            )}
                            <div className={`font-bold text-sm mb-1 ${paymentType === 'full' ? 'text-teal-400' : 'text-slate-300'}`}>Pay Full Amount</div>
                            <div className="text-[11px] text-slate-500 leading-tight">Complete your booking</div>
                        </button>

                        <button
                            onClick={() => handlePaymentTypeChange('registration')}
                            className={`p-4 rounded-xl border text-left transition-all relative group ${paymentType === 'registration'
                                ? 'border-teal-500/50 bg-teal-500/10 ring-1 ring-teal-500/30'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            {paymentType === 'registration' && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#2dd4bf] rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 ring-2 ring-[#0f172a]">
                                    <Check className="w-3 h-3 text-[#0f172a]" strokeWidth={3.5} />
                                </div>
                            )}
                            <div className={`font-bold text-sm mb-1 ${paymentType === 'registration' ? 'text-teal-400' : 'text-slate-300'}`}>Registration Only</div>
                            <div className="text-[11px] text-slate-500 leading-tight">Pay rest on departure</div>
                        </button>
                    </div>
                    {paymentType === 'registration' && (
                        <div className="mt-3 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 flex gap-3 items-start">
                            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                                <strong className="text-amber-400">Note:</strong> Registration fee is non-refundable. The remaining balance will be collected upon arrival.
                            </p>
                        </div>
                    )}
                </div>

                {/* Bill Details */}
                <div className="bg-white/5 rounded-2xl p-4 md:p-5 backdrop-blur-md" 
                     style={{ border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h4 className="font-bold text-slate-200 text-sm mb-4">Bill details</h4>

                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 flex items-center gap-2">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Base Fare
                            </span>
                            <span className="text-slate-200 font-medium tracking-wide">{formatCurrency(bookingData.price || 0)}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" />
                                Taxes & Fees (18% GST)
                            </span>
                            <span className="text-slate-200 font-medium tracking-wide">{formatCurrency(bookingData.taxes || 0)}</span>
                        </div>

                        {bookingData.discount && bookingData.discount > 0 && (
                            <div className="flex justify-between items-center text-xs text-green-400">
                                <span className="flex items-center gap-2 font-medium">
                                    Coupon Discount
                                </span>
                                <span className="font-bold tracking-wide">-{formatCurrency(bookingData.discount)}</span>
                            </div>
                        )}

                        <div className="h-px bg-white/10 my-2"></div>

                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-100 text-sm">
                                {paymentType === 'registration' ? 'Payable Now' : 'Grand total'}
                            </span>
                            <span className="font-black text-xl text-teal-400 tracking-tight">{formatCurrency(bookingData.totalAmount || 0)}</span>
                        </div>
                        {paymentType === 'registration' && (
                            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 pl-1">
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
                <div className="bg-white/5 rounded-2xl p-4 md:p-5 backdrop-blur-md" 
                     style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h4 className="font-bold text-slate-200 text-xs mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        Cancellation Policy
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                        Trip bookings can be cancelled subject to terms. The full booking amount will be refunded upon cancellation, except for the registration fee which is non-refundable.
                    </p>
                </div>
            </div>

            {/* Bottom Action Bar - Fixed Bottom Position */}
            <div className="px-3 md:px-4 py-3 sticky bottom-0 left-0 right-0 z-[100] w-full mt-auto backdrop-blur-md" 
                    style={{ background: 'rgba(15, 23, 42, 0.8)', borderTop: '1px solid rgba(92,225,230,0.1)' }}>
                
                {/* Unified Layout */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        disabled={isProcessing}
                        className="h-12 px-5 flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 active:scale-95 transition-all text-sm font-bold"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="flex-1 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-teal-500/20 active:scale-[0.98] text-sm md:text-base group hover:shadow-teal-500/30 overflow-hidden relative disabled:opacity-75 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(90deg, #2dd4bf 0%, #0d9488 100%)' }}
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Pay {formatCurrency(bookingData.totalAmount || 0)}
                                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
