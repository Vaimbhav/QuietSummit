import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { getMemberProfile, updateMemberPreferences as updateMemberAPI, getMemberBookings } from '../services/api'
import {
    Mail, Calendar, Heart, Bell, LogOut, User,
    Sparkles, MapPin, CheckCircle, Settings, Plane, Clock, DollarSign
} from 'lucide-react'
import Button from '@components/common/Button'
import Card from '@components/common/Card'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const navigate = useNavigate()
    const { user: authUser, logout } = useAuth()
    const [profile, setProfile] = useState<any>(null)
    const [bookings, setBookings] = useState<Array<Record<string, any>>>([])
    const [loading, setLoading] = useState(true)
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [newsletter, setNewsletter] = useState(true)
    const [updating, setUpdating] = useState(false)

    const allInterests = [
        'Mountain Trekking',
        'Beach Retreats',
        'Cultural Immersion',
        'Wellness & Yoga',
        'Wildlife & Nature',
        'Adventure Sports'
    ]

    useEffect(() => {
        // User email should be available from authUser (protected route ensures logged in)
        if (authUser?.email) {
            fetchProfile(authUser.email)
        }
    }, [authUser])

    const fetchProfile = async (email: string) => {
        try {
            const response = await getMemberProfile(email)
            setProfile(response.data)
            setSelectedInterests(response.data.interests || [])
            setNewsletter(response.data.subscribeToNewsletter)

            // Fetch bookings
            const bookingsResponse = await getMemberBookings(email)
            setBookings(bookingsResponse.data || [])
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Error fetching profile:', error)
            }
            // Silent fail - use basic user data from Redux
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleUpdatePreferences = async () => {
        if (!profile) return

        setUpdating(true)
        try {
            await updateMemberAPI({
                name: profile.name,
                email: profile.email,
                password: '', // Not updating password here
                interests: selectedInterests,
                subscribeToNewsletter: newsletter,
            })
            alert('Preferences updated successfully! ✅')
        } catch (error) {
            alert('Failed to update preferences')
        } finally {
            setUpdating(false)
        }
    }

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Card className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
                    <Button onClick={() => navigate('/signup')}>Go to Sign Up</Button>
                </Card>
            </div>
        )
    }

    const memberSince = new Date(profile.memberSince).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-neutral-50">
            {/* Header */}
            <section className="relative bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-accent-500/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6"
                    >
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 drop-shadow-2xl">
                                Welcome back, {profile.name}! 👋
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl opacity-90 font-light">
                                Your personalized travel dashboard
                            </p>
                        </div>
                        <div className="w-full sm:w-auto shrink-0">
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white/80 bg-white/10 backdrop-blur-md text-white font-semibold shadow-lg transition-all duration-300 w-full sm:w-auto hover:bg-white hover:text-primary-700 hover:border-white hover:shadow-2xl hover:scale-105 active:scale-95 group"
                            >
                                <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                                <span className="font-bold tracking-wide">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
                <div className="grid md:grid-cols-3 gap-6 md:gap-7 lg:gap-8 max-w-7xl mx-auto">
                    {/* Profile Card */}
                    <div className="md:col-span-1 space-y-4 sm:space-y-6">
                        <Card className="bg-gradient-to-br! from-primary-50 to-accent-50">
                            <div className="text-center">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white text-2xl sm:text-3xl font-bold shadow-lg">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
                                    {profile.name}
                                </h2>
                                <p className="text-sm sm:text-base text-neutral-600 flex items-center justify-center gap-2 mb-3 sm:mb-4 break-all px-2">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{profile.email}</span>
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-600">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary-600" />
                                Member Benefits
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Early access to new journeys',
                                    'Exclusive member discounts',
                                    'Priority booking',
                                    'Travel inspiration newsletter',
                                    'Member-only events',
                                ].map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                                        <CheckCircle className="w-5 h-5 text-primary-600 shrink-0" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-4 sm:space-y-6">
                        {/* Preferences */}
                        <Card>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                                    Travel Preferences
                                </h3>
                                <Button
                                    onClick={handleUpdatePreferences}
                                    isLoading={updating}
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    Save Changes
                                </Button>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="text-xs sm:text-sm font-bold text-neutral-700 mb-2 sm:mb-3 flex items-center gap-2">
                                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                                        Your Interests
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                                        {allInterests.map((interest) => (
                                            <label
                                                key={interest}
                                                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedInterests.includes(interest)
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-neutral-200 hover:border-primary-200'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedInterests.includes(interest)}
                                                    onChange={() => toggleInterest(interest)}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-neutral-300 text-primary-600 shrink-0"
                                                />
                                                <span className="text-sm sm:text-base font-medium text-neutral-700">
                                                    {interest}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-primary-50 rounded-xl">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newsletter}
                                            onChange={(e) => setNewsletter(e.target.checked)}
                                            className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-600"
                                        />
                                        <div>
                                            <div className="font-bold text-neutral-900 flex items-center gap-2 mb-1">
                                                <Bell className="w-4 h-4 text-primary-600" />
                                                Newsletter Subscription
                                            </div>
                                            <span className="text-sm text-neutral-600">
                                                Receive travel tips, exclusive offers, and journey updates
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <a href="/journeys">
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="p-5 sm:p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border-2 border-primary-100 cursor-pointer">
                                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mb-2 sm:mb-3" />
                                        <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">
                                            Browse Journeys
                                        </h4>
                                        <p className="text-xs sm:text-sm text-neutral-600">
                                            Discover your next adventure
                                        </p>
                                    </motion.div>
                                </a>

                                <a href="/contact">
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="p-5 sm:p-6 bg-gradient-to-br from-accent-50 to-primary-50 rounded-2xl border-2 border-accent-100 cursor-pointer">
                                        <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-accent-600 mb-2 sm:mb-3" />
                                        <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">
                                            Contact Us
                                        </h4>
                                        <p className="text-xs sm:text-sm text-neutral-600">
                                            Plan your personalized journey
                                        </p>
                                    </motion.div>
                                </a>
                            </div>
                        </Card>

                        {/* Travel History */}
                        {bookings && bookings.length > 0 && (
                            <Card>
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2 mb-2">
                                        <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                                        Your Travel History
                                    </h3>
                                    <div className="flex flex-col sm:flex-row sm:gap-6 gap-3 mt-4 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                            <span className="text-neutral-600">
                                                <span className="font-bold text-neutral-900">
                                                    {bookings.filter(b => b.status === 'confirmed' && new Date(b.startDate) < new Date()).length}
                                                </span> completed trips
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                                            <span className="text-neutral-600">
                                                <span className="font-bold text-neutral-900">
                                                    {bookings.filter(b => b.status === 'confirmed' && new Date(b.startDate) >= new Date()).length}
                                                </span> upcoming
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-primary-600 shrink-0" />
                                            <span className="text-neutral-600">
                                                Total: <span className="font-bold text-neutral-900">
                                                    ₹{bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {bookings.map((booking: any, idx: number) => (
                                        <motion.div
                                            key={booking._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-4 sm:p-5 bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-xl border border-neutral-200 hover:border-primary-300 transition-all cursor-pointer"
                                            onClick={() => navigate(`/booking-confirmation/${booking._id}`)}
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-base sm:text-lg text-neutral-900 mb-1">
                                                        {booking.journeyTitle}
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-neutral-600 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 shrink-0" />
                                                        {booking.destination}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${booking.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : booking.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-neutral-100 text-neutral-700'
                                                    }`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-neutral-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                    <span className="truncate">
                                                        {new Date(booking.startDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                    {booking.duration} days
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                    {booking.numberOfTravelers} {booking.numberOfTravelers > 1 ? 'travelers' : 'traveler'}
                                                </div>
                                                <div className="flex items-center gap-1 font-bold text-primary-700">
                                                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                    ₹{booking.totalAmount.toLocaleString()}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
