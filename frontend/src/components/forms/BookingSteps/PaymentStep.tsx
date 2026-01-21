import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, Shield, ChevronRight } from 'lucide-react'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'
import { createRazorpayOrder, verifyPayment, createBooking, getRazorpayKey } from '../../../services/api'
import { useNavigate } from 'react-router-dom'

interface PaymentStepProps {
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

export default function PaymentStep({ journey, bookingData, onBack, onClose }: PaymentStepProps) {
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
                callback_url: window.location.origin + '/booking-confirmation',
                redirect: false,
                handler: async function (response: any) {
                    try {
                        console.log('Payment success callback received', response);

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

                        if (!bookingId) {
                            throw new Error('No booking ID received from server');
                        }

                        // Update state first
                        setBookingReference(bookingId)
                        setIsSuccess(true)
                        setIsProcessing(false)

                        const confirmationUrl = `/booking-confirmation/${bookingId}`;

                        // Delay navigation to show success message and ensure smooth transition
                        setTimeout(() => {
                            try {
                                // Use React Router first
                                navigate(confirmationUrl, { replace: true });
                                onClose();
                            } catch (e) {
                                // Fallback for iOS/Mobile if context lost
                                console.warn('Navigation context lost, using window.location', e);
                                window.location.href = confirmationUrl;
                            }
                        }, 1000);
                    } catch (error: any) {
                        console.error('✗ Booking creation failed:', error)
                        setIsProcessing(false)
                        const errorMsg = error.response?.data?.error || error.message || 'Payment successful but booking creation failed.';
                        alert(errorMsg + ' Please contact support with Payment ID: ' + response.razorpay_payment_id)
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
                    color: '#6366f1',
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (isSuccess) {
        return (
            <div className="text-center py-12">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                <h3 className="text-3xl font-black text-neutral-900 mb-4">
                    Booking Confirmed! 🎉
                </h3>
                <p className="text-lg text-neutral-600 mb-2">
                    Your journey to {journey.destination} is confirmed
                </p>
                <div className="inline-block px-6 py-3 bg-primary-50 rounded-xl mb-6">
                    <p className="text-sm text-neutral-600">Booking Reference</p>
                    <p className="text-2xl font-black text-primary-600">{bookingReference}</p>
                </div>
                <p className="text-neutral-600">
                    A confirmation email has been sent to {bookingData.email}
                </p>
                <p className="text-sm text-neutral-500 mt-4">
                    Redirecting to confirmation page...
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-neutral-50/50 -m-8">
            <div className="flex-1 p-4 md:p-6 pb-24 overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Complete Payment</h3>
                        <p className="text-sm text-neutral-500 mt-1">Secure checkout powered by Razorpay</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                        <Shield className="w-6 h-6 text-green-700" />
                    </div>
                </div>

                <div className="bg-[#2D2D2D] text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold tracking-widest text-white/60 mb-1 uppercase">Amount Payable</p>
                            <h2 className="text-4xl font-black">{formatCurrency(bookingData.totalAmount || 0)}</h2>
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/10">
                            <Shield className="w-3 h-3 text-white/80" />
                            <span className="text-xs font-bold text-white/90">Secured Transaction</span>
                        </div>

                        <div className="h-px bg-white/10 w-full"></div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/5">
                                <span className="text-white/60 text-xs font-medium">Journey</span>
                                <span className="text-sm font-bold truncate max-w-[150px]">{journey.title}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/5">
                                <span className="text-white/60 text-xs font-medium">Travelers</span>
                                <span className="text-sm font-bold">{bookingData.numberOfTravelers} {bookingData.numberOfTravelers === 1 ? 'Person' : 'People'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-white p-4 border-t border-neutral-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 w-full mt-auto">
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        disabled={isProcessing}
                        className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-sm bg-white hover:bg-neutral-50 transition-colors min-w-[100px]"
                    >
                        Back
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl text-sm flex items-center justify-between transition-colors shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] opacity-80 uppercase tracking-wider font-medium">Total</span>
                            <span className="leading-none text-base">{formatCurrency(bookingData.totalAmount || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isProcessing ? 'Processing...' : 'Proceed'} <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
