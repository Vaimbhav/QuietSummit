import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, MapPin, Users, Mail, Phone } from 'lucide-react'
import { getBookingById } from '../services/api'
import Button from '@components/common/Button'
import Card from '@components/common/Card'

export default function BookingConfirmation() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [booking, setBooking] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBooking = async () => {
            if (!id) {
                navigate('/journeys')
                return
            }

            try {
                const response = await getBookingById(id)
                setBooking(response.data)
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error('Error fetching booking:', error)
                }
                setError('Failed to load booking details')
            } finally {
                setLoading(false)
            }
        }

        fetchBooking()
    }, [id, navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/journeys')}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        ← Return to Journeys
                    </button>
                </div>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Booking Not Found</h2>
                <Button onClick={() => navigate('/journeys')}>Browse Journeys</Button>
            </div>
        )
    }

    const bookingRef = `QS${booking._id.toString().slice(-8).toUpperCase()}`

    return (
        <div className="min-h-screen bg-linear-to-b from-primary-50 via-white to-neutral-50 py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <h1 className="text-5xl font-black text-neutral-900 mb-4">
                        Booking Confirmed! 🎉
                    </h1>
                    <p className="text-xl text-neutral-600 mb-6">
                        Your adventure to {booking.destination} is all set!
                    </p>
                    <div className="inline-block px-8 py-4 bg-linear-to-r from-primary-600 to-accent-600 text-white rounded-2xl shadow-lg">
                        <p className="text-sm opacity-90 mb-1">Booking Reference</p>
                        <p className="text-3xl font-black tracking-wider">{bookingRef}</p>
                    </div>
                </motion.div>

                {/* Booking Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6 mb-12"
                >
                    <Card>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Journey Details</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600 mb-1">Journey</p>
                                    <p className="font-bold text-neutral-900">{booking.journeyTitle}</p>
                                    <p className="text-sm text-neutral-600">{booking.destination}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600 mb-1">Travel Dates</p>
                                    <p className="font-bold text-neutral-900">
                                        {new Date(booking.startDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-sm text-neutral-600">{booking.duration} days</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600 mb-1">Travelers</p>
                                    <p className="font-bold text-neutral-900">
                                        {booking.numberOfTravelers}{' '}
                                        {booking.numberOfTravelers === 1 ? 'Traveler' : 'Travelers'}
                                    </p>
                                    <p className="text-sm text-neutral-600 capitalize">
                                        {booking.roomPreference} room
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600 mb-1">Payment Status</p>
                                    <p className="font-bold text-green-600">Paid</p>
                                    <p className="text-sm text-neutral-600">
                                        ₹{booking.totalAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Travelers List */}
                    {booking.travelers && booking.travelers.length > 0 && (
                        <Card>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Travelers</h2>
                            <div className="space-y-3">
                                {booking.travelers.map((traveler: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl"
                                    >
                                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-neutral-900">{traveler.name}</p>
                                            <p className="text-sm text-neutral-600">
                                                {traveler.age} years • {traveler.gender}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </motion.div>

                {/* Next Steps */}
                <Card className="!bg-linear-to-br from-primary-50 to-accent-50 border-2 border-primary-200 mb-8">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">What's Next?</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                1
                            </div>
                            <div>
                                <p className="font-bold text-neutral-900 mb-1">Check Your Email</p>
                                <p className="text-neutral-600 text-sm">
                                    We've sent a confirmation email to {booking.memberEmail} with all the
                                    details
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                2
                            </div>
                            <div>
                                <p className="font-bold text-neutral-900 mb-1">Prepare for Your Trip</p>
                                <p className="text-neutral-600 text-sm">
                                    We'll send you a detailed packing list and pre-trip information 30
                                    days before departure
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                3
                            </div>
                            <div>
                                <p className="font-bold text-neutral-900 mb-1">Get Ready for Adventure</p>
                                <p className="text-neutral-600 text-sm">
                                    Our team will contact you 7 days before departure with final details
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        size="lg"
                        className="flex items-center gap-2"
                    >
                        <Users className="w-5 h-5" />
                        View Dashboard
                    </Button>
                    <Button onClick={() => navigate('/journeys')} variant="outline" size="lg">
                        Browse More Journeys
                    </Button>
                </div>

                {/* Contact Section */}
                <div className="mt-12 text-center">
                    <p className="text-neutral-600 mb-4">Need help or have questions?</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a
                            href="mailto:info@quietsummit.com"
                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                        >
                            <Mail className="w-5 h-5" />
                            info@quietsummit.com
                        </a>
                        <a
                            href="tel:+911234567890"
                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                        >
                            <Phone className="w-5 h-5" />
                            +91 123 456 7890
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
