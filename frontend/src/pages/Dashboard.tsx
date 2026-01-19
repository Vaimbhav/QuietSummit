import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { getMemberProfile, updateMemberPreferences as updateMemberAPI, getMemberBookings } from '../services/api'
import {
    Mail, Calendar, Bell, User, CheckCircle, Settings, MapPin, Clock,
    Plane, DollarSign, Award, Package, AlertCircle, ArrowRight
} from 'lucide-react'
import Button from '@components/common/Button'
import Card from '@components/common/Card'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Dashboard() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isTravelerView = searchParams.get('view') === 'traveler'
    const { user: authUser } = useAuth()
    const [profile, setProfile] = useState<any>(null)
    const [bookings, setBookings] = useState<Array<Record<string, any>>>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [newsletter, setNewsletter] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
    const [bookingType, setBookingType] = useState<'Property' | 'Journey'>('Journey')

    // Redirect admin and host users to their respective dashboards
    useEffect(() => {
        // Allow hosts to view traveler dashboard if explicitly requested
        if (authUser?.role === 'host' && isTravelerView) {
            return
        }

        if (authUser?.role === 'admin') {
            navigate('/admin/dashboard')
        } else if (authUser?.role === 'host') {
            navigate('/host/dashboard')
        }
    }, [authUser?.role, navigate, isTravelerView])

    const allInterests = [
        'Mountain Trekking',
        'Beach Retreats',
        'Cultural Immersion',
        'Wellness & Yoga',
        'Wildlife & Nature',
        'Adventure Sports'
    ]

    useEffect(() => {
        if (authUser?.email) {
            fetchProfile(authUser.email)
        }
    }, [authUser?.email])

    const fetchProfile = async (email: string) => {
        try {
            setError(null)
            const response = await getMemberProfile(email)
            setProfile(response.data)
            setSelectedInterests(response.data.interests || [])
            setNewsletter(response.data.subscribeToNewsletter ?? true)

            // Fetch bookings
            try {
                const bookingsResponse = await getMemberBookings(email)
                setBookings(bookingsResponse.data || [])
            } catch (bookingError) {
                console.error('Error fetching bookings:', bookingError)
                // Don't fail the whole page if bookings fail
                setBookings([])
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            setError('Failed to load profile data')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePreferences = async () => {
        if (!profile) return

        setUpdating(true)
        try {
            await updateMemberAPI({
                name: profile.name,
                email: profile.email,
                password: '',
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

    // Helper to get booking date regardless of type
    const getBookingDate = (booking: any) => {
        return new Date(booking.startDate || booking.checkIn)
    }

    // Filter bookings by tab
    const typeBookings = bookings
        .filter(b => b.journeyModel === bookingType || (!b.journeyModel && bookingType === 'Property'))

    const filteredBookings = typeBookings
        .filter(booking => {
            const bookingDate = getBookingDate(booking)
            const isValidDate = !isNaN(bookingDate.getTime())
            const status = booking.bookingStatus

            if (status === 'cancelled') {
                return activeTab === 'cancelled'
            }

            // For non-cancelled bookings, rely on DATE logic primarily
            const now = new Date()
            now.setHours(0, 0, 0, 0)

            let isFuture = false
            if (isValidDate) {
                bookingDate.setHours(0, 0, 0, 0)
                isFuture = bookingDate >= now
            } else {
                // Fallback if Date is invalid: Rely on status
                isFuture = ['confirmed', 'pending'].includes(status)
            }

            if (activeTab === 'upcoming') {
                return isFuture
            } else if (activeTab === 'past') {
                return !isFuture
            }

            return false
        })

    // Calculate tab counts based on selected type
    const tabCounts = {
        upcoming: typeBookings.filter(b => {
            if (b.bookingStatus === 'cancelled') return false
            const date = getBookingDate(b)
            if (isNaN(date.getTime())) return ['confirmed', 'pending'].includes(b.bookingStatus)
            const now = new Date()
            now.setHours(0, 0, 0, 0)
            date.setHours(0, 0, 0, 0)
            return date >= now
        }).length,
        past: typeBookings.filter(b => {
            if (b.bookingStatus === 'cancelled') return false
            const date = getBookingDate(b)
            if (isNaN(date.getTime())) return b.bookingStatus === 'completed'
            const now = new Date()
            now.setHours(0, 0, 0, 0)
            date.setHours(0, 0, 0, 0)
            return date < now
        }).length,
        cancelled: typeBookings.filter(b => b.bookingStatus === 'cancelled').length
    }

    // Calculate stats
    const stats = {
        totalBookings: bookings.length,
        upcomingTrips: bookings.filter(b => {
            if (b.bookingStatus === 'cancelled') return false
            const date = getBookingDate(b)
            if (isNaN(date.getTime())) return ['confirmed', 'pending'].includes(b.bookingStatus)

            const now = new Date()
            now.setHours(0, 0, 0, 0)
            date.setHours(0, 0, 0, 0)
            return date >= now
        }).length,
        completedTrips: bookings.filter(b => {
            if (b.bookingStatus === 'cancelled') return false
            const date = getBookingDate(b)
            if (isNaN(date.getTime())) return b.bookingStatus === 'completed'

            const now = new Date()
            now.setHours(0, 0, 0, 0)
            date.setHours(0, 0, 0, 0)
            return date < now
        }).length,
        totalSpent: bookings.filter(b => b.bookingStatus !== 'cancelled').reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    }


    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-base font-medium text-neutral-600">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !profile) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
                <Card className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-neutral-900">Profile Not Found</h2>
                    <p className="text-neutral-600 mb-6">{error || 'Unable to load your profile'}</p>
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
        <div className="min-h-screen bg-neutral-50">
            {/* Premium Hero Section - Mobile Optimized */}
            <section className="relative bg-primary-600 text-white py-12 sm:py-16 md:py-20 overflow-hidden">
                <div className="container mx-auto px-6 sm:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold border border-white/20 flex-shrink-0">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
                                        Welcome back,<br className="sm:hidden" /> {profile.name.split(' ')[0]}!
                                    </h1>
                                    <p className="text-sm sm:text-base text-white/90">
                                        Manage your properties and bookings overview
                                    </p>
                                </div>
                            </div>

                            {authUser?.role === 'host' && (
                                <button
                                    onClick={() => navigate('/host/dashboard')}
                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shrink-0"
                                >
                                    <span>Switch to Hosting</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Overview - Premium Mobile Grid */}
            <div className="container mx-auto px-6 sm:px-8 lg:px-16 -mt-8 relative z-20 mb-8 lg:mb-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8">
                    {[
                        { icon: Package, label: 'Total Bookings', value: stats.totalBookings, color: 'bg-blue-600', iconBg: 'bg-blue-100' },
                        { icon: Plane, label: 'Upcoming', value: stats.upcomingTrips, color: 'bg-green-600', iconBg: 'bg-green-100' },
                        { icon: CheckCircle, label: 'Completed', value: stats.completedTrips, color: 'bg-purple-600', iconBg: 'bg-purple-100' },
                        { icon: DollarSign, label: 'Total Spend', value: `₹${stats.totalSpent.toLocaleString()}`, color: 'bg-emerald-600', iconBg: 'bg-emerald-100', fullWidth: true },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`${stat.fullWidth ? 'col-span-2 lg:col-span-1' : ''}`}
                        >
                            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-neutral-100 hover:shadow-lg transition-shadow">
                                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} strokeWidth={2} />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs sm:text-sm text-neutral-600 font-medium">{stat.label}</p>
                                    {stat.fullWidth && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                            <span>↗</span> ₹0 <span className="text-neutral-500">this month</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 sm:px-8 pb-12">
                <div className="grid lg:grid-cols-3 gap-6 items-start">
                    {/* Left Sidebar - Mobile Optimized */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
                        {/* Profile Card */}
                        <Card className="bg-white border border-neutral-100">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-sm">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                                    {profile.name}
                                </h2>
                                <p className="text-sm text-neutral-600 flex items-center justify-center gap-2 mb-4 px-2">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{profile.email}</span>
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-neutral-600 bg-neutral-50 rounded-full px-4 py-2 mx-auto w-fit">
                                    <Calendar className="w-4 h-4" />
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Member Benefits */}
                        <Card className="hidden lg:block">
                            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary-600" />
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
                                        <CheckCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Travel Preferences */}
                        <Card>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                                    <Settings className="w-6 h-6 text-primary-600" />
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

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary-600" />
                                        Your Interests
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {allInterests.map((interest) => (
                                            <label
                                                key={interest}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${selectedInterests.includes(interest)
                                                    ? 'border-primary-500 bg-primary-50 shadow-md'
                                                    : 'border-neutral-200 hover:border-primary-200'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedInterests.includes(interest)}
                                                    onChange={() => toggleInterest(interest)}
                                                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 shrink-0"
                                                />
                                                <span className="text-sm font-medium text-neutral-700">
                                                    {interest}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border-2 border-primary-100">
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

                        {/* Bookings Section */}
                        <Card>
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                                        <Plane className="w-6 h-6 text-primary-600" />
                                        Your Bookings
                                    </h3>
                                    {/* Type Toggle */}
                                    <div className="bg-neutral-100 p-1 rounded-lg flex self-start sm:self-auto">
                                        <button
                                            onClick={() => setBookingType('Journey')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${bookingType === 'Journey'
                                                ? 'bg-white text-primary-600 shadow-sm'
                                                : 'text-neutral-500 hover:text-neutral-700'
                                                }`}
                                        >
                                            Adventures
                                        </button>
                                        <button
                                            onClick={() => setBookingType('Property')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${bookingType === 'Property'
                                                ? 'bg-white text-primary-600 shadow-sm'
                                                : 'text-neutral-500 hover:text-neutral-700'
                                                }`}
                                        >
                                            Stays
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 border-b border-neutral-200">
                                    {[
                                        { key: 'upcoming' as const, label: 'Upcoming', count: tabCounts.upcoming },
                                        { key: 'past' as const, label: 'Past', count: tabCounts.past },
                                        { key: 'cancelled' as const, label: 'Cancelled', count: tabCounts.cancelled },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`px-4 py-3 font-bold text-sm transition-all relative ${activeTab === tab.key
                                                ? 'text-primary-600'
                                                : 'text-neutral-600 hover:text-neutral-900'
                                                }`}
                                        >
                                            {tab.label}
                                            {tab.count > 0 && (
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.key
                                                    ? 'bg-primary-100 text-primary-700'
                                                    : 'bg-neutral-100 text-neutral-600'
                                                    }`}>
                                                    {tab.count}
                                                </span>
                                            )}
                                            {activeTab === tab.key && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bookings List */}
                            <AnimatePresence mode="wait">
                                {filteredBookings.length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-8 h-8 text-neutral-400" />
                                        </div>
                                        <p className="text-neutral-600 mb-4">No {activeTab} bookings</p>
                                        <Button onClick={() => navigate('/journeys')} variant="outline">
                                            Browse Journeys
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="list"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        {filteredBookings.map((booking: any, idx: number) => (
                                            <motion.div
                                                key={booking._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => navigate(`/booking-confirmation/${booking._id}`)}
                                                className="group p-5 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-luxury-lg transition-all cursor-pointer"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-lg text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                                                            {booking.journeyTitle}
                                                        </h4>
                                                        <p className="text-sm text-neutral-600 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 shrink-0" />
                                                            {booking.destination}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${booking.bookingStatus === 'confirmed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : booking.bookingStatus === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {booking.bookingStatus.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-neutral-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4 shrink-0" />
                                                        <span className="truncate">
                                                            {new Date(booking.startDate || booking.checkIn).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4 shrink-0" />
                                                        {booking.duration} days
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-4 h-4 shrink-0" />
                                                        {booking.numberOfTravelers} {booking.numberOfTravelers > 1 ? 'travelers' : 'traveler'}
                                                    </div>
                                                    <div className="flex items-center gap-1 font-bold text-primary-700">
                                                        <DollarSign className="w-4 h-4 shrink-0" />
                                                        ₹{booking.totalAmount.toLocaleString()}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.a
                                    href="/journeys"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="block p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border-2 border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all"
                                >
                                    <MapPin className="w-8 h-8 text-primary-600 mb-3" />
                                    <h4 className="text-lg font-bold text-neutral-900 mb-1">
                                        Browse Journeys
                                    </h4>
                                    <p className="text-sm text-neutral-600">
                                        Discover your next adventure
                                    </p>
                                </motion.a>

                                <motion.a
                                    href="/properties"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="block p-6 bg-gradient-to-br from-accent-50 to-primary-50 rounded-2xl border-2 border-accent-100 hover:border-accent-300 hover:shadow-lg transition-all"
                                >
                                    <Package className="w-8 h-8 text-accent-600 mb-3" />
                                    <h4 className="text-lg font-bold text-neutral-900 mb-1">
                                        Browse Properties
                                    </h4>
                                    <p className="text-sm text-neutral-600">
                                        Find your perfect stay
                                    </p>
                                </motion.a>
                            </div>
                        </Card>
                    </div>
                </div>


            </div>
        </div>
    )
}
