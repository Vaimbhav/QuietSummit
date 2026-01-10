import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getJourneys } from '../services/api'
import { Journey } from '../types/journey'
import Button from '@components/common/Button'

const ITEMS_PER_PAGE = 9

export default function Journeys() {
    const [allJourneys, setAllJourneys] = useState<Journey[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'easy' | 'moderate' | 'challenging'>('all')
    const [selectedRegion, setSelectedRegion] = useState<string>('')
    const [sortBy, setSortBy] = useState<'newest' | 'price' | 'price-high' | 'duration'>('newest')
    const [currentPage, setCurrentPage] = useState(1)

    // Extract unique regions from all journeys
    const regions = Array.from(new Set(allJourneys.map(j => j.location.region))).sort()

    useEffect(() => {
        const fetchJourneys = async () => {
            try {
                setLoading(true)
                const data = await getJourneys()
                setAllJourneys(data)
            } catch (err) {
                console.error(err)
                setError('Failed to load journeys. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchJourneys()
    }, [])

    // Client-side filtering
    const filteredJourneys = allJourneys.filter(journey => {
        const matchesDifficulty = filter === 'all' || journey.difficulty === filter
        const matchesRegion = !selectedRegion || journey.location.region === selectedRegion
        return matchesDifficulty && matchesRegion
    })

    // Sorting
    const sortedJourneys = [...filteredJourneys].sort((a, b) => {
        if (sortBy === 'price') return a.basePrice - b.basePrice
        if (sortBy === 'price-high') return b.basePrice - a.basePrice
        if (sortBy === 'duration') return a.duration.days - b.duration.days
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
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            {/* Header */}
            <section className="relative bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 text-white pt-24 sm:pt-28 lg:pt-32 pb-20 sm:pb-24 lg:pb-32 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 tracking-tight drop-shadow-2xl">
                            Our Journeys
                        </h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-95 leading-relaxed font-light">
                            Discover curated experiences designed for slow, intentional travel. Each journey is crafted to help you reconnect with nature and yourself.
                        </p>
                    </motion.div>
                </div>
                {/* Bottom wave effect */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-16 fill-neutral-50">
                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                    </svg>
                </div>
            </section>

            {/* Filter Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect p-4 sm:p-6 lg:p-8 rounded-2xl shadow-premium mb-8 sm:mb-10 lg:mb-12 border border-primary-100"
                >
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {/* Difficulty Filter */}
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-neutral-700 mb-2 sm:mb-3 block">
                                Difficulty Level
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {(['all', 'easy', 'moderate', 'challenging'] as const).map((level) => (
                                    <Button
                                        key={level}
                                        variant={filter === level ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setFilter(level)}
                                        className="text-xs sm:text-sm"
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                            {/* Region Filter */}
                            <div className="relative md:col-span-1">
                                <label className="text-xs sm:text-sm font-medium text-neutral-700 mb-2 sm:mb-3 block">
                                    Region
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="appearance-none pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white w-full text-sm sm:text-base truncate transition-all cursor-pointer"
                                    >
                                        <option value="">All Regions</option>
                                        {regions.map((region) => (
                                            <option key={region} value={region}>
                                                {region}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="relative md:col-span-1">
                                <label className="text-xs sm:text-sm font-medium text-neutral-700 mb-2 sm:mb-3 block">
                                    Sort By
                                </label>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="appearance-none pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white w-full text-sm sm:text-base truncate transition-all cursor-pointer"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price">Price (Low to High)</option>
                                        <option value="price-high">Price (High to Low)</option>
                                        <option value="duration">Duration (Short to Long)</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-end md:col-span-2">
                                <div className="text-xs sm:text-sm text-neutral-600 bg-primary-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg w-full text-center md:text-right font-medium">
                                    <span className="font-bold">{filteredJourneys.length}</span> {filteredJourneys.length === 1 ? 'journey' : 'journeys'} found
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

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
                            }}
                            variant="primary"
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
                            {paginatedJourneys.map((journey) => (
                                <Link to={`/journeys/${journey.slug}`} key={journey._id} className="group h-full">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                        className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-100 shadow-premium hover:shadow-premium-lg transition-all duration-500 h-full flex flex-col"
                                    >
                                        <div className="relative h-48 sm:h-56 md:h-60 lg:h-64 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                                            <img
                                                src={journey.images[0] || '/images/placeholder.jpg'}
                                                alt={journey.title}
                                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 glass-effect px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold tracking-wider uppercase text-neutral-900 shadow-lg z-20">
                                                {journey.difficulty}
                                            </div>
                                        </div>
                                        <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-grow">
                                            <div className="flex items-center gap-2 text-primary-600 text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span className="tracking-wide truncate">{journey.location.region}, {journey.location.country}</span>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-primary-700 transition-colors leading-tight tracking-tight line-clamp-2">
                                                {journey.title}
                                            </h3>
                                            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 flex-grow">
                                                {journey.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 sm:pt-5 border-t border-neutral-100 mt-auto">
                                                <div className="flex items-center gap-1.5 sm:gap-2 text-neutral-600">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm font-medium">{journey.duration.days} Days</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 sm:gap-1 text-primary-700 font-semibold">
                                                    <span className="text-xs font-medium">From</span>
                                                    <span className="text-lg sm:text-xl font-bold">₹{journey.basePrice.toLocaleString()}</span>
                                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform flex-shrink-0" />
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
