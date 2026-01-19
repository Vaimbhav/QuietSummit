import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, X, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getJourneys } from '../services/api'
import { Journey } from '../types/journey'
import Button from '@components/common/Button'
import { createPortal } from 'react-dom'

const ITEMS_PER_PAGE = 9

// Helper to handle duration which can be number or object
const getDurationDays = (duration: number | { days: number }): number => {
    if (typeof duration === 'number') return duration;
    return duration.days || 0;
};

export default function Journeys() {
    const [allJourneys, setAllJourneys] = useState<Journey[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'easy' | 'moderate' | 'challenging'>('all')
    const [selectedRegion, setSelectedRegion] = useState<string>('')
    const [sortBy, setSortBy] = useState<'newest' | 'price' | 'price-high' | 'duration'>('newest')
    const [currentPage, setCurrentPage] = useState(1)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Extract unique regions from all journeys with null check
    const regions = Array.from(
        new Set(
            allJourneys
                .filter(j => j.location?.region) // Filter out journeys without location/region
                .map(j => j.location.region)
        )
    ).sort()

    useEffect(() => {
        const fetchJourneys = async () => {
            try {
                setLoading(true)
                const data = await getJourneys()
                setAllJourneys(data)
            } catch (err) {
                setError('Failed to load journeys. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchJourneys()
    }, [])

    // Client-side filtering with null checks
    const filteredJourneys = allJourneys.filter(journey => {
        const matchesDifficulty = filter === 'all' || journey.difficulty === filter
        const matchesRegion = !selectedRegion || journey.location?.region === selectedRegion
        return matchesDifficulty && matchesRegion
    })

    // Sorting
    const sortedJourneys = [...filteredJourneys].sort((a, b) => {
        if (sortBy === 'price') return a.basePrice - b.basePrice
        if (sortBy === 'price-high') return b.basePrice - a.basePrice
        if (sortBy === 'duration') return getDurationDays(a.duration) - getDurationDays(b.duration)
        // newest (default) - by createdAt
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Pagination
    const totalPages = Math.ceil(sortedJourneys.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedJourneys = sortedJourneys.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filter, selectedRegion])

    // Scroll to top when page changes
    useEffect(() => {
        // Use setTimeout to ensure DOM has finished rendering
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 0)
        return () => clearTimeout(timer)
    }, [currentPage])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-red-600">
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAF9F7] text-neutral-900">
            {/* Header */}
            <section className="relative bg-primary-600 text-white pb-28 pt-20 sm:pb-32 sm:pt-24 md:pb-32 lg:pb-36 overflow-hidden">
                <div className="container mx-auto px-6 sm:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                            Our Journeys
                        </h1>
                        <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                            Discover curated experiences designed for slow, intentional travel. Each journey is crafted to help you reconnect with nature and yourself.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mobile Filter Button - Overlapping */}
            <div className="md:hidden container mx-auto px-6 -mt-16 sm:-mt-20 relative z-20 mb-6">
                <motion.button
                    onClick={() => setIsFilterOpen(true)}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full bg-white rounded-2xl px-6 py-5 flex items-center justify-between shadow-lg border border-neutral-200 hover:shadow-xl transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
                            <Filter className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-base font-bold text-neutral-900">Filters</div>
                            <div className="text-sm text-neutral-600 font-medium">{filteredJourneys.length} {filteredJourneys.length === 1 ? 'journey' : 'journeys'}</div>
                        </div>
                    </div>
                    <ChevronDown className="w-6 h-6 text-neutral-600" />
                </motion.button>
            </div>

            {/* Desktop Filter Section - Overlapping */}
            <div className="hidden md:block container mx-auto px-6 sm:px-8 md:-mt-20 lg:-mt-24 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 mb-12"
                >
                    <div className="flex flex-col gap-6">
                        {/* Difficulty Filter */}
                        <div>
                            <label className="text-sm font-semibold text-neutral-900 mb-4 block">
                                Difficulty Level
                            </label>
                            <div className="flex gap-2.5 flex-wrap">
                                {(['all', 'easy', 'moderate', 'challenging'] as const).map((level) => (
                                    <Button
                                        key={level}
                                        variant={filter === level ? 'luxury' : 'ghost'}
                                        size="sm"
                                        onClick={() => {
                                            setFilter(level)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="text-xs sm:text-sm font-extrabold"
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
                            {/* Region Filter */}
                            <div className="relative md:col-span-1">
                                <label className="text-xs sm:text-sm font-extrabold text-neutral-900 mb-2 sm:mb-3 block uppercase tracking-wide">
                                    Region
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRegion}
                                        onChange={(e) => {
                                            setSelectedRegion(e.target.value)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="appearance-none pl-5 pr-12 py-3.5 border-2 border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-white w-full text-sm sm:text-base font-semibold truncate transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        aria-label="Filter by region"
                                    >
                                        <option value="">All Regions</option>
                                        {regions.map((region) => (
                                            <option key={region} value={region}>
                                                {region}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="relative md:col-span-1">
                                <label className="text-xs sm:text-sm font-extrabold text-neutral-900 mb-2 sm:mb-3 block uppercase tracking-wide">
                                    Sort By
                                </label>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value as any)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="appearance-none pl-5 pr-12 py-3.5 border-2 border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-white w-full text-sm sm:text-base font-semibold truncate transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        aria-label="Sort journeys"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price">Price (Low to High)</option>
                                        <option value="price-high">Price (High to Low)</option>
                                        <option value="duration">Duration (Short to Long)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-end md:col-span-2">
                                <div className="text-sm sm:text-base gradient-primary px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl w-full text-center md:text-right font-extrabold text-white shadow-luxury">
                                    <span className="text-lg">{filteredJourneys.length}</span> {filteredJourneys.length === 1 ? 'journey' : 'journeys'} found
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Mobile Filter Dropdown */}
            {createPortal(
                <AnimatePresence>
                    {isFilterOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFilterOpen(false)}
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden"
                            />

                            {/* Premium Dropdown Panel */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="fixed top-32 left-4 right-4 z-[9999] md:hidden max-w-md mx-auto"
                            >
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-neutral-200/50 overflow-hidden">
                                    {/* Compact Header */}
                                    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-5 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <Filter className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-base font-bold text-white">Filter & Sort</h3>
                                        </div>
                                        <button
                                            onClick={() => setIsFilterOpen(false)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                            aria-label="Close filters"
                                        >
                                            <X className="w-4 h-4 text-white/80" />
                                        </button>
                                    </div>

                                    {/* Compact Filter Content */}
                                    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                                        {/* Difficulty Filter */}
                                        <div>
                                            <label className="text-[10px] font-bold text-neutral-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                                                Difficulty
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(['all', 'easy', 'moderate', 'challenging'] as const).map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => setFilter(level)}
                                                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${filter === level
                                                            ? 'bg-neutral-900 text-white shadow-lg'
                                                            : 'bg-neutral-50 border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
                                                            }`}
                                                    >
                                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Region & Sort - Side by Side */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Region Filter */}
                                            <div>
                                                <label className="text-[10px] font-bold text-neutral-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                                                    Region
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={selectedRegion}
                                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                                        className="appearance-none pl-3 pr-7 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-white w-full text-xs font-medium text-neutral-700 transition-all cursor-pointer hover:border-neutral-300"
                                                        aria-label="Filter by region"
                                                    >
                                                        <option value="">All</option>
                                                        {regions.map((region) => (
                                                            <option key={region} value={region}>
                                                                {region}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Sort By */}
                                            <div>
                                                <label className="text-[10px] font-bold text-neutral-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                                                    Sort
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={sortBy}
                                                        onChange={(e) => setSortBy(e.target.value as any)}
                                                        className="appearance-none pl-3 pr-7 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-white w-full text-xs font-medium text-neutral-700 transition-all cursor-pointer hover:border-neutral-300"
                                                        aria-label="Sort journeys"
                                                    >
                                                        <option value="newest">Newest</option>
                                                        <option value="price">Price ↑</option>
                                                        <option value="price-high">Price ↓</option>
                                                        <option value="duration">Duration</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compact Results Badge */}
                                        <div className="rounded-xl px-4 py-2.5 text-center bg-gradient-to-r from-neutral-900 to-neutral-800 shadow-lg">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-xl font-black text-white">{filteredJourneys.length}</span>
                                                <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                                                    {filteredJourneys.length === 1 ? 'Journey' : 'Journeys'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Compact Action Buttons */}
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => {
                                                    setFilter('all')
                                                    setSelectedRegion('')
                                                    setSortBy('newest')
                                                }}
                                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors border border-neutral-200"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsFilterOpen(false)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }}
                                                className="flex-[2] px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-lg"
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Journeys Grid Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 lg:pb-12">

                {/* Journeys Grid */}
                {paginatedJourneys.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">No journeys found</h3>
                        <p className="text-neutral-600 mb-4">Try adjusting your filters</p>
                        <Button
                            onClick={() => {
                                setFilter('all')
                                setSelectedRegion('')
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            variant="primary"
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9 md:gap-10">
                            {paginatedJourneys.map((journey) => (
                                <Link to={`/journeys/${journey.slug}`} key={journey._id} className="group h-full">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -12, scale: 1.01, transition: { duration: 0.3 } }}
                                        className="glass-luxury rounded-4xl overflow-hidden shadow-luxury-lg hover:shadow-luxury-2xl transition-all duration-500 h-full flex flex-col border-luxury"
                                    >
                                        <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10"></div>
                                            <img
                                                src={journey.images[0] || '/images/placeholder.jpg'}
                                                alt={journey.title}
                                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 sm:top-5 right-4 sm:right-5 glass-luxury px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-primary-700 shadow-luxury z-20 border-luxury">
                                                {journey.difficulty}
                                            </div>
                                        </div>
                                        <div className="p-6 sm:p-7 lg:p-8 flex flex-col grow">
                                            <div className="flex items-center gap-2 text-primary-700 text-xs sm:text-sm font-extrabold mb-3 sm:mb-4">
                                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                                <span className="tracking-wide truncate uppercase">{journey.location.region}, {journey.location.country}</span>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 group-hover:text-primary-700 transition-colors leading-tight text-premium line-clamp-2">
                                                {journey.title}
                                            </h3>
                                            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-5 sm:mb-7 grow font-medium">
                                                {journey.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 sm:pt-5 border-t-2 border-neutral-100 mt-auto">
                                                <div className="flex items-center gap-2 sm:gap-2.5 text-neutral-700">
                                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                                    <span className="text-sm sm:text-base font-extrabold">{getDurationDays(journey.duration)} Days</span>
                                                </div>
                                                <div className="flex items-center gap-1 sm:gap-1.5 text-primary-700 font-black">
                                                    <span className="text-xs font-bold uppercase">From</span>
                                                    <span className="text-xl sm:text-2xl">₹{journey.basePrice.toLocaleString()}</span>
                                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 group-hover:translate-x-2 transition-transform shrink-0" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 sm:mt-10 lg:mt-12 flex-wrap">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 sm:p-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${currentPage === page
                                            ? 'bg-primary-600 text-white'
                                            : 'border border-neutral-300 hover:bg-neutral-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 sm:p-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
