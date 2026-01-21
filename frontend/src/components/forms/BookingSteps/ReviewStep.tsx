import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Clock, FileText, Info, ShieldCheck, ShoppingBag, Loader2, CheckCircle } from 'lucide-react'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'
import { createRazorpayOrder, verifyPayment, createBooking, getRazorpayKey } from '../../../services/api'
import { useNavigate } from 'react-router-dom'

interface ReviewStepProps {
    journey: Journey
    bookingData: Partial<BookingData>
    onBack: () => void
    onClose: () => void
}

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function ReviewStep({ journey, bookingData, onBack, onClose }: ReviewStepProps) {
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [bookingReference, setBookingReference] = useState('')

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
        if (!dateString) return 'Not selected'
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
                                    <p className="font-bold text-neutral-900">{formatCurrency(journey.basePrice)}</p>
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

                {/* Bill Details */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
                    <h4 className="font-bold text-neutral-900 text-sm mb-3">Bill details</h4>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-600 flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                Base Fare
                            </span>
                            <span className="text-neutral-900 font-medium">{formatCurrency(bookingData.basePrice || 0)}</span>
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
                            <span className="font-bold text-neutral-900">Grand total</span>
                            <span className="font-bold text-neutral-900">{formatCurrency(bookingData.totalAmount || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-4">
                    <h4 className="font-bold text-neutral-900 text-sm mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-neutral-400" />
                        Cancellation Policy
                    </h4>
                    <p className="text-xs text-neutral-500 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                        Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
                    </p>
                </div>
            </div>

            {/* Bottom Action Bar - Fixed Bottom Position */}
            <div className="bg-white px-4 py-5 border-t border-neutral-200/80 sticky bottom-0 left-0 right-0 z-[100] w-full mt-auto">
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        disabled={isProcessing}
                        className="px-8 py-3.5 rounded-xl border-2 border-neutral-300 text-neutral-700 font-bold text-sm bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-all min-w-[100px] active:scale-95 flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-between transition-all shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[11px] opacity-90 uppercase tracking-wide font-semibold">Total</span>
                            <span className="leading-none text-lg font-bold mt-0.5">{formatCurrency(bookingData.totalAmount || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-base">
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Proceed <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
