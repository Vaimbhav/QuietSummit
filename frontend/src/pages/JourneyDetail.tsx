import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    MapPin, Calendar, Users, TrendingUp, Check, X,
    Clock, ChevronDown, ChevronUp, ArrowLeft,
    Sun, Cloud, Snowflake, Leaf, Star
} from 'lucide-react'
import { getJourneyBySlug } from '../services/api'
import { Journey } from '../types/journey'
import Button from '@components/common/Button'
import BookingForm from '@components/forms/BookingForm'
import BookingGuard from '@components/common/BookingGuard'
import JourneyGallery from '@components/journey/JourneyGallery'

export default function JourneyDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [journey, setJourney] = useState<Journey | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedDay, setExpandedDay] = useState<number | null>(0)
    const [isBookingOpen, setIsBookingOpen] = useState(false)

    // Check if there's a saved booking state and auto-open modal
    useEffect(() => {
        if (journey && !isBookingOpen) {
            const savedBooking = sessionStorage.getItem(`booking_${journey._id}`)
            if (savedBooking) {
                // Booking was in progress, reopen the modal
                setIsBookingOpen(true)
            }
        }
    }, [journey])

    useEffect(() => {
        const fetchJourney = async () => {
            try {
                setLoading(true)
                const data = await getJourneyBySlug(id || '')
                setJourney(data)
            } catch (err) {
                setError('Failed to load journey details. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchJourney()
        }
    }, [id])

    const getSeasonIcon = (season: string) => {
        const s = season.toLowerCase()
        if (s.includes('spring')) return <Leaf className="w-4 h-4" />
        if (s.includes('summer')) return <Sun className="w-4 h-4" />
        if (s.includes('autumn') || s.includes('fall')) return <Leaf className="w-4 h-4" />
        if (s.includes('winter')) return <Snowflake className="w-4 h-4" />
        return <Cloud className="w-4 h-4" />
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200'
            case 'moderate': return 'bg-amber-100 text-amber-800 border-amber-200'
            case 'challenging': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-neutral-100 text-neutral-800 border-neutral-200'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
            </div>
        )
    }

    if (error || !journey) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-center px-4">
                <div className="text-6xl mb-6">😔</div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Journey Not Found</h2>
                <p className="text-neutral-600 mb-8">{error || 'The journey you are looking for does not exist.'}</p>
                <Button onClick={(e) => { e.stopPropagation(); navigate('/journeys') }} variant="primary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Journeys
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-100/50 via-primary-100/40 to-accent-100/50 pb-20 md:pb-0">
            {/* Hero Section with Navigation */}
            <section className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>
                </div>

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            navigate('/journeys')
                        }}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4 sm:mb-6 transition-colors font-medium text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        Back to Journeys
                    </button>

                    {/* Difficulty Badge Positioned Above Gallery */}
                    <div className="relative mb-4">
                        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
                            <span className={`text-xs sm:text-sm font-bold tracking-wider uppercase ${getDifficultyColor(journey.difficulty)}`}>
                                {journey.difficulty}
                            </span>
                        </div>
                        <JourneyGallery images={journey.images} title={journey.title} />
                    </div>
                </div>

                {/* Bottom decorative wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-12 sm:h-16 fill-white opacity-90">
                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                    </svg>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
                <div className="grid xl:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-2 space-y-8 sm:space-y-10 lg:space-y-12">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-2 sm:gap-3 text-primary-600 mb-3 sm:mb-4">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-base sm:text-lg font-semibold tracking-wide">
                                    {journey.location.region}, {journey.location.country}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4 sm:mb-6 tracking-tight leading-tight">
                                {journey.title}
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-neutral-700 leading-relaxed">
                                {journey.description}
                            </p>
                        </motion.div>

                        {/* Quick Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5"
                        >
                            <div className="glass-luxury rounded-3xl p-5 sm:p-6 shadow-luxury-lg border-luxury hover:shadow-luxury-xl transition-all duration-300 group">
                                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white p-2 rounded-2xl gradient-premium mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-luxury" />
                                <div className="text-2xl sm:text-3xl font-black text-neutral-900 text-premium gradient-text-premium">
                                    {typeof journey.duration === 'number' ? journey.duration : journey.duration.days}
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-neutral-600 mt-1 sm:mt-2 uppercase tracking-wide">
                                    Days / {typeof journey.duration === 'number' ? journey.duration - 1 : journey.duration.nights} Nights
                                </div>
                            </div>
                            {journey.departureDates && journey.departureDates.length > 0 && (
                                <div className="glass-luxury rounded-3xl p-5 sm:p-6 shadow-luxury-lg border-luxury hover:shadow-luxury-xl transition-all duration-300 group">
                                    <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white p-2 rounded-2xl gradient-premium mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-luxury" />
                                    <div className="text-xl sm:text-2xl font-black text-neutral-900 text-premium gradient-text-premium">
                                        {new Date(journey.departureDates[0]).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold text-neutral-600 mt-1 sm:mt-2 uppercase tracking-wide">Departure Date</div>
                                </div>
                            )}
                            <div className="glass-luxury rounded-3xl p-5 sm:p-6 shadow-luxury-lg border-luxury hover:shadow-luxury-xl transition-all duration-300 group">
                                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white p-2 rounded-2xl gradient-premium mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-luxury" />
                                <div className="text-2xl sm:text-3xl font-black text-neutral-900 text-premium gradient-text-premium">{journey.maxGroupSize}</div>
                                <div className="text-xs sm:text-sm font-bold text-neutral-600 mt-1 sm:mt-2 uppercase tracking-wide">Max Group Size</div>
                            </div>
                            <div className="glass-luxury rounded-3xl p-5 sm:p-6 shadow-luxury-lg border-luxury hover:shadow-luxury-xl transition-all duration-300 group">
                                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-white p-2 rounded-2xl gradient-premium mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-luxury" />
                                <div className="text-2xl sm:text-3xl font-black text-neutral-900 capitalize text-premium gradient-text-premium">{journey.difficulty}</div>
                                <div className="text-xs sm:text-sm font-bold text-neutral-600 mt-1 sm:mt-2 uppercase tracking-wide">Difficulty Level</div>
                            </div>
                            <div className="glass-luxury rounded-3xl p-5 sm:p-6 shadow-luxury-lg border-luxury hover:shadow-luxury-xl transition-all duration-300 group">
                                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white p-2 rounded-2xl gradient-premium mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-luxury" />
                                <div className="text-2xl sm:text-3xl font-black text-neutral-900 text-premium gradient-text-premium">{journey.season.length}</div>
                                <div className="text-xs sm:text-sm font-bold text-neutral-600 mt-1 sm:mt-2 uppercase tracking-wide">Best Seasons</div>
                            </div>
                        </motion.div>

                        {/* Ideal For */}
                        {journey.idealFor && journey.idealFor.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-luxury rounded-4xl p-8 sm:p-10 shadow-luxury-lg border-luxury"
                            >
                                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-6 sm:mb-8 text-luxury">Ideal For</h2>
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                    {journey.idealFor.map((item, idx) => (
                                        <span
                                            key={idx}
                                            className="px-6 py-3 gradient-primary text-white rounded-2xl text-sm font-extrabold shadow-luxury hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300 uppercase tracking-wide"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Best Seasons */}
                        {journey.season && journey.season.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="glass-luxury rounded-4xl p-6 sm:p-8 md:p-10 shadow-luxury-lg border-luxury"
                            >
                                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-5 sm:mb-7 text-luxury">Best Time to Visit</h2>
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                    {journey.season.map((s, idx) => (
                                        <span
                                            key={idx}
                                            className="flex items-center gap-2 sm:gap-2.5 px-5 sm:px-6 md:px-7 py-3 sm:py-3.5 gradient-accent text-white rounded-2xl text-sm sm:text-base font-extrabold shadow-luxury hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300"
                                        >
                                            {getSeasonIcon(s)}
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Includes & Excludes */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
                        >
                            {/* Includes */}
                            <div className="glass-luxury rounded-4xl p-6 sm:p-8 md:p-10 shadow-luxury-lg border-luxury">
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="p-2.5 sm:p-3 gradient-primary rounded-2xl shrink-0 shadow-luxury">
                                        <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={3} />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 text-luxury">What's Included</h2>
                                </div>
                                <ul className="space-y-3 sm:space-y-4">
                                    {journey.includes.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 sm:gap-4 group">
                                            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                                            <span className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Excludes */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-neutral-200 shadow-sm">
                                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                                    <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg shrink-0">
                                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
                                    </div>
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Not Included</h2>
                                </div>
                                <ul className="space-y-2 sm:space-y-2.5 md:space-y-3">
                                    {journey.excludes.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                                            <X className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600 shrink-0 mt-0.5" />
                                            <span className="text-xs sm:text-sm md:text-base text-neutral-700 leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Itinerary */}
                        {journey.itinerary && journey.itinerary.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-neutral-200 shadow-sm"
                            >
                                <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-6 sm:mb-7 md:mb-8 tracking-tight">Day-by-Day Itinerary</h2>
                                <div className="space-y-3 sm:space-y-4">
                                    {journey.itinerary.map((day, idx) => (
                                        <div
                                            key={day.day}
                                            className="border border-neutral-200 rounded-lg sm:rounded-xl overflow-hidden transition-all hover:border-primary-300"
                                        >
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setExpandedDay(expandedDay === idx ? null : idx)
                                                }}
                                                className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                    <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary-600 text-white rounded-full font-bold text-base sm:text-lg shrink-0">
                                                        {day.day}
                                                    </div>
                                                    <div className="text-left flex-1 min-w-0">
                                                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 truncate">{day.title}</h3>
                                                        <p className="text-xs sm:text-sm text-neutral-600 font-medium truncate">{day.accommodation}</p>
                                                    </div>
                                                </div>
                                                {expandedDay === idx ? (
                                                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600 shrink-0 ml-2" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600 shrink-0 ml-2" />
                                                )}
                                            </button>

                                            {expandedDay === idx && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="p-6 bg-white border-t border-neutral-200"
                                                >
                                                    <p className="text-neutral-700 leading-relaxed mb-6">{day.description}</p>

                                                    {day.activities && day.activities.length > 0 && (
                                                        <div className="mb-6">
                                                            <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                                                <span className="text-primary-600">Activities:</span>
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {day.activities.map((activity, i) => (
                                                                    <li key={i} className="flex items-start gap-3">
                                                                        <span className="text-primary-600">•</span>
                                                                        <span className="text-neutral-700">{activity}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {day.meals && day.meals.length > 0 && (
                                                        <div className="bg-accent-50 rounded-lg p-4 border border-accent-100">
                                                            <h4 className="font-bold text-accent-900 mb-2">Meals Included:</h4>
                                                            <p className="text-accent-800">{day.meals.join(', ')}</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Testimonials */}
                        {journey.testimonials && journey.testimonials.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-neutral-200 shadow-sm"
                            >
                                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6 sm:mb-8 tracking-tight">What Travelers Say</h2>
                                <div className="space-y-4 sm:space-y-6">
                                    {journey.testimonials.map((testimonial, idx) => (
                                        <div key={idx} className="border-l-4 border-primary-500 pl-4 sm:pl-6 py-2">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed mb-2 sm:mb-3 italic">"{testimonial.text}"</p>
                                            <p className="text-xs sm:text-sm font-bold text-neutral-900">— {testimonial.author}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Booking Card (Desktop) */}
                    <div className="xl:col-span-1 hidden md:block">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="xl:sticky xl:top-24 bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 border-2 border-primary-200 shadow-lg"
                        >
                            <div className="mb-5 sm:mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-xs sm:text-sm text-neutral-600 font-medium">Starting from</span>
                                </div>
                                <div className="flex items-baseline gap-1.5 sm:gap-2">
                                    <span className="text-3xl sm:text-3xl md:text-4xl font-bold text-neutral-900">₹{journey.basePrice.toLocaleString()}</span>
                                    <span className="text-sm sm:text-base text-neutral-600 font-medium">/ person</span>
                                </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-7 md:mb-8">
                                <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-neutral-200">
                                    <span className="text-sm sm:text-base text-neutral-700 font-medium">Duration</span>
                                    <span className="text-sm sm:text-base text-neutral-900 font-bold">
                                        {typeof journey.duration === 'number' ? journey.duration : journey.duration.days} Days / {typeof journey.duration === 'number' ? journey.duration - 1 : journey.duration.nights} Nights
                                    </span>
                                </div>
                                {journey.departureDates && journey.departureDates.length > 0 && (
                                    <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-neutral-200">
                                        <span className="text-sm sm:text-base text-neutral-700 font-medium">Departure</span>
                                        <span className="text-sm sm:text-base text-neutral-900 font-bold">
                                            {new Date(journey.departureDates[0]).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-neutral-200">
                                    <span className="text-sm sm:text-base text-neutral-700 font-medium">Group Size</span>
                                    <span className="text-sm sm:text-base text-neutral-900 font-bold">Max {journey.maxGroupSize}</span>
                                </div>
                                <div className="flex items-center justify-between py-2.5 sm:py-3">
                                    <span className="text-sm sm:text-base text-neutral-700 font-medium">Difficulty</span>
                                    <span className="text-sm sm:text-base text-neutral-900 font-bold capitalize">{journey.difficulty}</span>
                                </div>
                            </div>

                            <BookingGuard onAuthenticated={() => setIsBookingOpen(true)}>
                                {(openBooking) => (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            openBooking()
                                        }}
                                        variant="primary"
                                        size="lg"
                                        className="w-full mb-3 sm:mb-4 text-base sm:text-lg font-bold py-3 sm:py-4"
                                    >
                                        Book This Journey
                                    </Button>
                                )}
                            </BookingGuard>

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigate('/contact')
                                }}
                                variant="ghost"
                                size="lg"
                                className="w-full font-semibold text-sm sm:text-base py-3 sm:py-4"
                            >
                                Contact Us
                            </Button>

                            <p className="text-xs text-neutral-500 text-center mt-4 sm:mt-5 md:mt-6 leading-relaxed px-2">
                                Have questions? Our team is here to help you plan your perfect journey.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Bar (Mobile Only) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t-2 border-primary-200 shadow-2xl p-4">
                <div className="flex items-center justify-between gap-4 max-w-screen-xl mx-auto">
                    <div className="flex flex-col">
                        <span className="text-xs text-neutral-600 font-medium">Starting from</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-neutral-900">₹{journey.basePrice.toLocaleString()}</span>
                            <span className="text-xs text-neutral-600">/ person</span>
                        </div>
                    </div>
                    <BookingGuard onAuthenticated={() => setIsBookingOpen(true)}>
                        {(openBooking) => (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    openBooking()
                                }}
                                variant="primary"
                                size="lg"
                                className="px-8 py-3 text-base font-bold"
                            >
                                Book Now
                            </Button>
                        )}
                    </BookingGuard>
                </div>
            </div>

            {/* Booking Form Modal */}
            {journey && (
                <BookingForm
                    journey={journey}
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                />
            )}
        </div>
    )
}
