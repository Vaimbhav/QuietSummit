import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, Smartphone, Building2, Wallet, Banknote } from 'lucide-react'
import Button from '../../common/Button'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'
import { createRazorpayOrder, verifyPayment, createBooking } from '../../../services/api'
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
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                alert('Failed to load payment gateway. Please try again.')
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

            // Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
                amount: amount,
                currency: currency,
                name: 'QuietSummit',
                description: journey.title,
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
                        })

                        setBookingReference(bookingResponse.data.bookingReference)
                        setIsSuccess(true)
                        setIsProcessing(false)

                        // Redirect to confirmation after 3 seconds
                        setTimeout(() => {
                            navigate(`/booking-confirmation/${bookingResponse.data.bookingId}`)
                            onClose()
                        }, 3000)
                    } catch (error) {
                        console.error('Booking creation failed:', error)
                        alert('Payment successful but booking creation failed. Please contact support.')
                        setIsProcessing(false)
                    }
                },
                prefill: {
                    name: bookingData.travelers?.[0]?.name || '',
                    email: bookingData.email || '',
                    contact: bookingData.travelers?.[0]?.emergencyContact || '',
                },
                theme: {
                    color: '#6366f1',
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment cancelled by user')
                        setIsProcessing(false)
                    }
                }
            }

            const razorpay = new window.Razorpay(options)

            razorpay.on('payment.failed', function (response: any) {
                console.error('Payment failed:', response)
                alert('Payment failed. Please try again.')
                setIsProcessing(false)
            })

            razorpay.open()
        } catch (error: any) {
            console.error('Payment error:', error)
            alert('Failed to initiate payment. Please try again.')
            setIsProcessing(false)
        }
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
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">Payment</h3>
                <p className="text-sm sm:text-base text-neutral-600">Secure payment powered by Razorpay</p>
            </div>

            {/* Payment Summary */}
            <div className="p-5 sm:p-6 md:p-8 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 text-white rounded-2xl sm:rounded-3xl shadow-lg">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-white/80 text-xs sm:text-sm">Total Amount</p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-black">
                            ₹{bookingData.totalAmount?.toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-white/80">{journey.title}</span>
                        <span className="font-bold text-right">
                            {bookingData.numberOfTravelers} {bookingData.numberOfTravelers === 1 ? 'traveler' : 'travelers'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/80">Departure</span>
                        <span className="font-bold text-right">
                            {new Date(bookingData.departureDate || '').toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="p-4 sm:p-6 bg-neutral-50 rounded-xl sm:rounded-2xl">
                <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">Accepted Payment Methods</h4>
                <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-neutral-900">Cards</p>
                            <p className="text-xs sm:text-sm text-neutral-600">Credit/Debit</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-neutral-900">UPI</p>
                            <p className="text-xs sm:text-sm text-neutral-600">GPay, PhonePe</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-neutral-900">Net Banking</p>
                            <p className="text-xs sm:text-sm text-neutral-600">All Banks</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-neutral-900">Wallets</p>
                            <p className="text-xs sm:text-sm text-neutral-600">Paytm, etc.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-neutral-900">EMI</p>
                            <p className="text-xs sm:text-sm text-neutral-600">0% Interest</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                    <p className="font-bold text-green-900 mb-1">Secure Payment</p>
                    <p className="text-green-700">
                        Your payment information is encrypted and secure. We never store your card
                        details.
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-3 pt-4">
                <Button
                    onClick={handlePayment}
                    size="lg"
                    isLoading={isProcessing}
                    leftIcon={<CreditCard className="w-5 h-5" />}
                    className="w-full"
                >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                </Button>
                <Button variant="outline" onClick={onBack} disabled={isProcessing} className="w-full font-semibold">
                    ← Back
                </Button>
            </div>
        </div>
    )
}
