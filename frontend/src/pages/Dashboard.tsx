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
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)' }}>
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'rgba(92,225,230,0.2)' }}></div>
                        <div className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin" style={{ borderColor: '#5CE1E6' }}></div>
                    </div>
                    <p className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)' }}>
                <Card variant="dark" className="text-center max-w-md backdrop-blur-md border shadow-xl" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.2)' }}>
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-white">Profile Not Found</h2>
                    <p className="mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>{error || 'Unable to load your profile'}</p>
                    <Button onClick={() => navigate('/signup')} style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}>Go to Sign Up</Button>
                </Card>
            </div>
        )
    }

    const memberSince = new Date(profile.memberSince).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)' }}>
            {/* Premium Hero Section - Mobile Optimized */}
            <section className="relative text-white py-12 sm:py-16 md:py-20 overflow-hidden">
                {/* Background gradient overlay */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(92,225,230,0.1) 0%, rgba(74,144,226,0.1) 100%)' }} />

                <div className="container mx-auto px-6 sm:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold border flex-shrink-0" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', borderColor: 'rgba(255,255,255,0.2)', color: '#0a0e27' }}>
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 leading-tight">
                                        Welcome back, <span style={{ color: '#5CE1E6' }}>{profile.name.split(' ')[0]}</span>!
                                    </h1>
                                    <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                        Your personal travel dashboard
                                    </p>
                                </div>
                            </div>

                            {authUser?.role === 'host' && (
                                <button
                                    onClick={() => navigate('/host/dashboard')}
                                    className="group relative px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 text-sm shrink-0 overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}
                                >
                                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                    <div className="p-1 rounded-full mr-1" style={{ background: 'rgba(10,14,39,0.1)' }}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    </div>
                                    <span className="relative z-10">Switch to Hosting</span>
                                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Overview - Premium Mobile Grid */}
            <div className="container mx-auto px-6 sm:px-8 lg:px-16 -mt-8 relative z-20 mb-8 lg:mb-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {[
                        { icon: Package, label: 'Total Bookings', value: stats.totalBookings, gradientFrom: '#5CE1E6', gradientTo: '#4A90E2' },
                        { icon: Plane, label: 'Upcoming', value: stats.upcomingTrips, gradientFrom: '#10b981', gradientTo: '#059669' },
                        { icon: CheckCircle, label: 'Completed', value: stats.completedTrips, gradientFrom: '#8b5cf6', gradientTo: '#6d28d9' },
                        { icon: DollarSign, label: 'Total Spend', value: `₹${stats.totalSpent.toLocaleString()}`, gradientFrom: '#f59e0b', gradientTo: '#d97706', fullWidth: true },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`${stat.fullWidth ? 'col-span-2 lg:col-span-1' : ''}`}
                        >
                            <div className="backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-xl border hover:shadow-2xl hover:scale-105 transition-all duration-300" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: `linear-gradient(135deg, ${stat.gradientFrom} 0%, ${stat.gradientTo} 100%)` }}>
                                    <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{stat.label}</p>
                                    {stat.fullWidth && stats.totalSpent > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                                            <span>↗</span>
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
                        <Card variant="dark" className="backdrop-blur-md border shadow-xl" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}>
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    {profile.name}
                                </h2>
                                <p className="text-sm flex items-center justify-center gap-2 mb-4 px-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{profile.email}</span>
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs rounded-full px-4 py-2 mx-auto w-fit" style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(92,225,230,0.15)' }}>
                                    <Calendar className="w-4 h-4" />
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Member Benefits */}
                        <Card variant="dark" className="hidden lg:block backdrop-blur-md border shadow-xl" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5" style={{ color: '#5CE1E6' }} />
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
                                    <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#5CE1E6' }} />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Travel Preferences */}
                        <Card variant="dark" className="backdrop-blur-md border shadow-xl" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Settings className="w-6 h-6" style={{ color: '#5CE1E6' }} />
                                    Travel Preferences
                                </h3>
                                <Button
                                    onClick={handleUpdatePreferences}
                                    isLoading={updating}
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}
                                >
                                    Save Changes
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4" style={{ color: '#5CE1E6' }} />
                                        Your Interests
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {allInterests.map((interest) => (
                                            <label
                                                key={interest}
                                                className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105"
                                                style={selectedInterests.includes(interest)
                                                    ? { borderColor: '#5CE1E6', background: 'rgba(92,225,230,0.15)', boxShadow: '0 4px 6px rgba(92,225,230,0.2)' }
                                                    : { borderColor: 'rgba(92,225,230,0.2)', background: 'rgba(10,14,39,0.4)' }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedInterests.includes(interest)}
                                                    onChange={() => toggleInterest(interest)}
                                                    className="w-5 h-5 rounded shrink-0"
                                                    style={{ accentColor: '#5CE1E6' }}
                                                />
                                                <span className="text-sm font-medium text-white">
                                                    {interest}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border-2" style={{ background: 'rgba(92,225,230,0.1)', borderColor: 'rgba(92,225,230,0.3)' }}>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newsletter}
                                            onChange={(e) => setNewsletter(e.target.checked)}
                                            className="mt-1 w-5 h-5 rounded"
                                            style={{ accentColor: '#5CE1E6' }}
                                        />
                                        <div>
                                            <div className="font-bold text-white flex items-center gap-2 mb-1">
                                                <Bell className="w-4 h-4" style={{ color: '#5CE1E6' }} />
                                                Newsletter Subscription
                                            </div>
                                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                Receive travel tips, exclusive offers, and journey updates
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </Card>

                        {/* Bookings Section */}
                        <Card variant="dark" className="backdrop-blur-md border shadow-xl" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <Plane className="w-6 h-6" style={{ color: '#5CE1E6' }} />
                                        Your Bookings
                                    </h3>
                                    {/* Type Toggle */}
                                    <div className="p-1 rounded-lg flex self-start sm:self-auto" style={{ background: 'rgba(10,14,39,0.6)' }}>
                                        <button
                                            onClick={() => setBookingType('Journey')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${bookingType === 'Journey'
                                                ? 'shadow-sm'
                                                : 'hover:text-white'
                                                }`}
                                            style={bookingType === 'Journey'
                                                ? { background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }
                                                : { color: 'rgba(255,255,255,0.6)' }}
                                        >
                                            Adventures
                                        </button>
                                        <button
                                            onClick={() => setBookingType('Property')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${bookingType === 'Property'
                                                ? 'shadow-sm'
                                                : 'hover:text-white'
                                                }`}
                                            style={bookingType === 'Property'
                                                ? { background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }
                                                : { color: 'rgba(255,255,255,0.6)' }}
                                        >
                                            Stays
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2" style={{ borderBottom: '1px solid rgba(92,225,230,0.2)' }}>
                                    {[
                                        { key: 'upcoming' as const, label: 'Upcoming', count: tabCounts.upcoming },
                                        { key: 'past' as const, label: 'Past', count: tabCounts.past },
                                        { key: 'cancelled' as const, label: 'Cancelled', count: tabCounts.cancelled },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className="px-4 py-3 font-bold text-sm transition-all relative"
                                            style={{ color: activeTab === tab.key ? '#5CE1E6' : 'rgba(255,255,255,0.6)' }}
                                        >
                                            {tab.label}
                                            {tab.count > 0 && (
                                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                                                    style={activeTab === tab.key
                                                        ? { background: 'rgba(92,225,230,0.2)', color: '#5CE1E6' }
                                                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                                                    {tab.count}
                                                </span>
                                            )}
                                            {activeTab === tab.key && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5"
                                                    style={{ background: '#5CE1E6' }}
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
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(92,225,230,0.1)' }}>
                                            <Package className="w-8 h-8" style={{ color: '#5CE1E6' }} />
                                        </div>
                                        <p className="mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>No {activeTab} bookings</p>
                                        <Button onClick={() => navigate('/journeys')} variant="outline" style={{ borderColor: '#5CE1E6', color: '#5CE1E6' }}>
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
                                                className="group p-5 backdrop-blur-md rounded-2xl border-2 hover:shadow-2xl transition-all cursor-pointer"
                                                style={{ background: 'rgba(10,14,39,0.4)', borderColor: 'rgba(92,225,230,0.2)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5CE1E6'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(92,225,230,0.2)'}
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-lg text-white mb-1 group-hover:text-[#5CE1E6] transition-colors">
                                                            {booking.journeyTitle}
                                                        </h4>
                                                        <p className="text-sm flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                            <MapPin className="w-3 h-3 shrink-0" />
                                                            {booking.destination}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${booking.bookingStatus === 'confirmed'
                                                        ? 'text-green-400'
                                                        : booking.bookingStatus === 'pending'
                                                            ? 'text-yellow-400'
                                                            : 'text-red-400'
                                                        }`}
                                                        style={{ background: 'rgba(255,255,255,0.1)' }}>
                                                        {booking.bookingStatus.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
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
                                                    <div className="flex items-center gap-1 font-bold" style={{ color: '#5CE1E6' }}>
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
                        <Card variant="dark" className="backdrop-blur-md border shadow-xl" style={{ background: 'rgba(30,33,57,0.6)', borderColor: 'rgba(92,225,230,0.2)' }}>
                            <h3 className="text-2xl font-bold text-white mb-6">
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.a
                                    href="/journeys"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="block p-6 rounded-2xl border-2 hover:shadow-2xl transition-all"
                                    style={{ background: 'rgba(92,225,230,0.1)', borderColor: 'rgba(92,225,230,0.3)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(92,225,230,0.3)'}
                                >
                                    <MapPin className="w-8 h-8 mb-3" style={{ color: '#5CE1E6' }} />
                                    <h4 className="text-lg font-bold text-white mb-1">
                                        Browse Journeys
                                    </h4>
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                        Discover your next adventure
                                    </p>
                                </motion.a>

                                <motion.a
                                    href="/properties"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="block p-6 rounded-2xl border-2 hover:shadow-2xl transition-all"
                                    style={{ background: 'rgba(74,144,226,0.1)', borderColor: 'rgba(74,144,226,0.3)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4A90E2'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(74,144,226,0.3)'}
                                >
                                    <Package className="w-8 h-8 mb-3" style={{ color: '#4A90E2' }} />
                                    <h4 className="text-lg font-bold text-white mb-1">
                                        Browse Properties
                                    </h4>
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
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
