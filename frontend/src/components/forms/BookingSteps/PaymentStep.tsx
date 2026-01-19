import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, Smartphone, Building2, Wallet, Banknote, Shield } from 'lucide-react'
import Button from '../../common/Button'
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

                        setBookingReference(bookingResponse.bookingId)
                        setIsSuccess(true)
                        setIsProcessing(false)

                        // Redirect to confirmation after 3 seconds
                        setTimeout(() => {
                            navigate(`/booking-confirmation/${bookingResponse.bookingId}`)
                            onClose()
                        }, 3000)
                    } catch (error) {
                        console.error('✗ Booking creation failed:', error)
                        alert('Payment successful but booking creation failed. Please contact support.')
                        setIsProcessing(false)
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
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl md:text-4xl font-black text-neutral-900 mb-2 tracking-tight">
                        Complete Payment
                    </h3>
                    <p className="text-neutral-600 text-base md:text-lg">Secure checkout powered by Razorpay</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl shadow-sm">
                    <Shield className="w-9 h-9 text-primary-600" />
                </div>
            </div>

            {/* Payment Summary Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl">
                {/* Enhanced Abstract Patterns */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-40 -mt-40 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary-500/20 to-transparent rounded-full -ml-40 -mb-40 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                                <CreditCard className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-white/70 text-xs uppercase tracking-[0.2em] font-bold mb-2">Amount Payable</p>
                                <p className="text-5xl md:text-6xl font-black tracking-tight">
                                    ₹{bookingData.totalAmount?.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20 self-start md:self-center shadow-lg">
                            <span className="text-sm font-bold text-white tracking-wide">🔒 Secured Transaction</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-8 border-t border-white/20">
                        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 px-5 border border-white/10">
                            <span className="text-white/70 text-sm font-medium">Journey</span>
                            <span className="font-bold text-white text-lg truncate max-w-[180px]">{journey.title}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 px-5 border border-white/10">
                            <span className="text-white/70 text-sm font-medium">Travelers</span>
                            <span className="font-bold text-white text-lg">
                                {bookingData.numberOfTravelers} {bookingData.numberOfTravelers === 1 ? 'Person' : 'People'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-gradient-to-br from-white to-neutral-50/50 rounded-[2.5rem] p-8 md:p-10 border-2 border-neutral-200/80 shadow-2xl">
                <h4 className="text-xl md:text-2xl font-black text-neutral-900 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 rounded-xl">
                        <Wallet className="w-6 h-6 md:w-7 md:h-7 text-neutral-700" />
                    </div>
                    <span>Payment Methods</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-50 to-blue-100/50', name: 'Cards', sub: 'Credit/Debit' },
                        { icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-50 to-purple-100/50', name: 'UPI', sub: 'GPay, PhonePe, Paytm' },
                        { icon: Building2, color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-green-50 to-green-100/50', name: 'Net Banking', sub: 'All Major Banks' },
                        { icon: Banknote, color: 'text-indigo-600', bg: 'bg-indigo-100', gradient: 'from-indigo-50 to-indigo-100/50', name: 'EMI', sub: 'Easy Installments' }
                    ].map((method, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className={`group flex items-center gap-5 p-5 md:p-6 bg-gradient-to-br ${method.gradient} rounded-2xl border-2 border-neutral-200 hover:border-primary-400 hover:shadow-xl transition-all duration-300 cursor-default`}
                        >
                            <div className={`w-14 h-14 ${method.bg} rounded-2xl flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                <method.icon className={`w-7 h-7 ${method.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-black text-neutral-900 group-hover:text-primary-700 transition-colors mb-0.5">{method.name}</p>
                                <p className="text-sm text-neutral-600 font-medium">{method.sub}</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg"></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-5 p-6 md:p-7 bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl border-2 border-green-200/80 shadow-lg">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shrink-0 shadow-md">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
                <div>
                    <p className="font-black text-green-900 mb-2 text-lg">Bank-Grade Security</p>
                    <p className="text-green-800/90 leading-relaxed text-base">
                        Your payment is processed securely with industry-leading 256-bit encryption to protect your financial information.
                    </p>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-6">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isProcessing}
                    className="flex-1 py-6 text-lg font-bold rounded-2xl border-2 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 order-2 md:order-1"
                >
                    Back
                </Button>
                <Button
                    onClick={handlePayment}
                    size="lg"
                    isLoading={isProcessing}
                    leftIcon={!isProcessing && <CreditCard className="w-5 h-5" />}
                    className="flex-[2] py-6 text-lg font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 hover:from-black hover:via-neutral-900 hover:to-black order-1 md:order-2"
                >
                    {isProcessing ? 'Processing Payment...' : `Pay ₹${bookingData.totalAmount?.toLocaleString()}`}
                </Button>
            </div>
        </div>
    )
}
