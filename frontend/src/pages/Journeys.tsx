import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, X, Filter, RotateCcw } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
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
    const [searchParams, setSearchParams] = useSearchParams()
    const [allJourneys, setAllJourneys] = useState<Journey[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Initialize state from URL params
    const [filter, setFilter] = useState<'all' | 'easy' | 'moderate' | 'challenging'>(
        (searchParams.get('difficulty') as any) || 'all'
    )
    const [selectedRegion, setSelectedRegion] = useState<string>(
        searchParams.get('region') || ''
    )
    const [sortBy, setSortBy] = useState<'newest' | 'price' | 'price-high' | 'duration'>(
        (searchParams.get('sort') as any) || 'newest'
    )
    const [timing, setTiming] = useState<'upcoming' | 'past'>(
        (searchParams.get('timing') as any) || 'upcoming'
    )

    const [currentPage, setCurrentPage] = useState(1)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Update URL when filters change
    useEffect(() => {
        const params: any = {}
        if (filter !== 'all') params.difficulty = filter
        if (selectedRegion) params.region = selectedRegion
        if (sortBy !== 'newest') params.sort = sortBy
        if (timing !== 'upcoming') params.timing = timing
        setSearchParams(params, { replace: true })
    }, [filter, selectedRegion, sortBy, timing, setSearchParams])


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
                const data = await getJourneys({ timing })
                setAllJourneys(data)
            } catch (err) {
                setError('Failed to load journeys. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchJourneys()
    }, [timing])

    // Client-side filtering with null checks
    const filteredJourneys = allJourneys.filter(journey => {
        const matchesDifficulty = filter === 'all' || journey.difficulty === filter
        const matchesRegion = !selectedRegion || journey.location?.region === selectedRegion
        return matchesDifficulty && matchesRegion
    })

    // Sorting
    const sortedJourneys = [...filteredJourneys].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
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
    }, [filter, selectedRegion, timing, sortBy])

    // Scroll to top when page changes
    useEffect(() => {
        // Use setTimeout to ensure DOM has finished rendering
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 0)
        return () => clearTimeout(timer)
    }, [currentPage])

    return (
        <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0e27' }}>
            {/* Header */}
            <section className="relative text-white pb-24 pt-16 sm:pb-28 sm:pt-20 md:pb-32 lg:pb-36 overflow-hidden" style={{ background: '#0a0e27' }}>
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 blur-3xl rounded-full" style={{ background: 'rgba(92,225,230,0.3)' }} />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 blur-3xl rounded-full" style={{ background: 'rgba(74,144,226,0.25)' }} />
                </div>
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
            <div className="md:hidden container mx-auto px-4 -mt-14 sm:-mt-16 relative z-20 mb-8">
                <motion.button
                    onClick={() => setIsFilterOpen(true)}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg border transition-all"
                    style={{ background: '#1e2139', borderColor: 'rgba(92,225,230,0.2)', boxShadow: '0 12px 28px rgba(0,0,0,0.4)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}>
                            <Filter className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-white">Filters</div>
                            <div className="text-xs font-medium" style={{ color: '#B0B7C3' }}>{filteredJourneys.length} {filteredJourneys.length === 1 ? 'journey' : 'journeys'}</div>
                        </div>
                    </div>
                    <ChevronDown className="w-5 h-5" style={{ color: '#B0B7C3' }} />
                </motion.button>
            </div>

            {/* Desktop Filter Section - Overlapping */}
            <div className="hidden md:block container mx-auto px-4 sm:px-6 md:-mt-16 lg:-mt-20 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl shadow-lg border mb-10"
                    style={{ background: '#1e2139', borderColor: 'rgba(92,225,230,0.15)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}
                >
                    <div className="flex flex-col gap-5">
                        {/* Difficulty Filter */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-white mb-3 block uppercase tracking-wide">
                                    Difficulty Level
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {(['all', 'easy', 'moderate', 'challenging'] as const).map((level) => (
                                        <Button
                                            key={level}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setFilter(level)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}
                                            className={`text-xs font-extrabold transition-all duration-300 ${filter !== level ? 'hover:bg-white/5' : ''}`}
                                            style={filter === level ? {
                                                backgroundColor: '#5CE1E6',
                                                color: '#0a0e27',
                                                boxShadow: 'none'
                                            } : {
                                                color: '#B0B7C3'
                                            }}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset Filters */}
                            {(filter !== 'all' || selectedRegion || sortBy !== 'newest' || timing !== 'upcoming') && (
                                <button
                                    onClick={() => {
                                        setFilter('all')
                                        setSelectedRegion('')
                                        setSortBy('newest')
                                        setTiming('upcoming')
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors group mt-5"
                                    style={{ color: '#B0B7C3' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ff6b6b'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#B0B7C3'}
                                >
                                    <div className="p-1.5 rounded-full transition-colors" style={{ background: '#1e2139' }}>
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </div>
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Adventure Type Filter */}
                            <div className="relative md:col-span-1">
                                <label className="text-xs font-extrabold text-white mb-2 block uppercase tracking-wide">
                                    Adventure Type
                                </label>
                                <div className="relative">
                                    <select
                                        value={timing}
                                        onChange={(e) => {
                                            setTiming(e.target.value as 'upcoming' | 'past')
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="appearance-none pl-4 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:border-cyan-400 w-full text-sm font-semibold truncate transition-all cursor-pointer shadow-sm hover:shadow-md text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_1rem] bg-no-repeat"
                                        style={{ background: '#0a0e27', borderColor: 'rgba(92,225,230,0.2)', focusRingColor: 'rgba(92,225,230,0.5)' }}
                                        aria-label="Filter by adventure type"
                                    >
                                        <option value="upcoming">Upcoming Adventures</option>
                                        <option value="past">Past Expeditions</option>
                                    </select>
                                </div>
                            </div>

                            {/* Region Filter */}
                            <div className="relative md:col-span-1">
                                <label className="text-xs font-extrabold text-white mb-2 block uppercase tracking-wide">
                                    Region
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRegion}
                                        onChange={(e) => {
                                            setSelectedRegion(e.target.value)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="appearance-none pl-4 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:border-cyan-400 w-full text-sm font-semibold truncate transition-all cursor-pointer shadow-sm hover:shadow-md text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_1rem] bg-no-repeat"
                                        style={{ background: '#0a0e27', borderColor: 'rgba(92,225,230,0.2)' }}
                                        aria-label="Filter by region"
                                    >
                                        <option value="">All Regions</option>
                                        {regions.map((region) => (
                                            <option key={region} value={region}>
                                                {region}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="relative md:col-span-1">
                                <label className="text-xs font-extrabold text-white mb-2 block uppercase tracking-wide">
                                    Sort By
                                </label>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value as any)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="appearance-none pl-4 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:border-cyan-400 w-full text-sm font-semibold truncate transition-all cursor-pointer shadow-sm hover:shadow-md text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_1rem] bg-no-repeat"
                                        style={{ background: '#0a0e27', borderColor: 'rgba(92,225,230,0.2)' }}
                                        aria-label="Sort journeys"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price">Price (Low to High)</option>
                                        <option value="price-high">Price (High to Low)</option>
                                        <option value="duration">Duration (Short to Long)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-end md:col-span-1">
                                <div className="text-sm px-4 py-2.5 rounded-xl w-full text-center md:text-right font-extrabold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}>
                                    <span className="text-base">{filteredJourneys.length}</span> {filteredJourneys.length === 1 ? 'found' : 'found'}
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
                                className="fixed top-28 left-4 right-4 z-[9999] md:hidden max-w-md mx-auto"
                            >
                                <div className="backdrop-blur-xl rounded-3xl overflow-hidden" style={{
                                    background: 'rgba(30, 33, 57, 0.95)',
                                    border: '1px solid rgba(92, 225, 230, 0.2)',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                                }}>
                                    {/* Compact Header */}
                                    <div className="px-5 py-4 flex items-center justify-between" style={{
                                        background: 'rgba(10, 14, 39, 0.6)',
                                        borderBottom: '1px solid rgba(92, 225, 230, 0.1)'
                                    }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                                                background: 'rgba(92, 225, 230, 0.15)',
                                                border: '1px solid rgba(92, 225, 230, 0.3)'
                                            }}>
                                                <Filter className="w-5 h-5" style={{ color: '#5CE1E6' }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">Filter & Sort</h3>
                                        </div>
                                        <button
                                            onClick={() => setIsFilterOpen(false)}
                                            className="p-1.5 rounded-lg transition-colors"
                                            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                            aria-label="Close filters"
                                        >
                                            <X className="w-5 h-5 text-white/80" />
                                        </button>
                                    </div>

                                    {/* Compact Filter Content */}
                                    <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                                        {/* Journey Type */}
                                        <div className="flex p-1 rounded-2xl" style={{ background: 'rgba(10, 14, 39, 0.5)' }}>
                                            <button
                                                onClick={() => setTiming('upcoming')}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                                                style={timing === 'upcoming'
                                                    ? { background: 'rgba(92, 225, 230, 0.2)', color: '#5CE1E6', border: '1px solid rgba(92, 225, 230, 0.3)' }
                                                    : { background: 'transparent', color: '#B0B7C3' }
                                                }
                                            >
                                                Upcoming
                                            </button>
                                            <button
                                                onClick={() => setTiming('past')}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                                                style={timing === 'past'
                                                    ? { background: 'rgba(92, 225, 230, 0.2)', color: '#5CE1E6', border: '1px solid rgba(92, 225, 230, 0.3)' }
                                                    : { background: 'transparent', color: '#B0B7C3' }
                                                }
                                            >
                                                Past
                                            </button>
                                        </div>

                                        {/* Difficulty Filter */}
                                        <div>
                                            <label className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2" style={{ color: '#5CE1E6' }}>
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5CE1E6' }}></div>
                                                DIFFICULTY
                                            </label>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                {(['all', 'easy', 'moderate', 'challenging'] as const).map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => setFilter(level)}
                                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                                        style={filter === level
                                                            ? {
                                                                background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)',
                                                                color: 'white',
                                                                boxShadow: '0 4px 15px rgba(61, 157, 163, 0.3)'
                                                            }
                                                            : {
                                                                background: 'rgba(10, 14, 39, 0.5)',
                                                                color: '#B0B7C3',
                                                                border: '1px solid rgba(92, 225, 230, 0.15)'
                                                            }
                                                        }
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
                                                <label className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2" style={{ color: '#5CE1E6' }}>
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5CE1E6' }}></div>
                                                    REGION
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={selectedRegion}
                                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                                        className="appearance-none pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:ring-2 w-full text-sm font-semibold transition-all cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.75rem] bg-no-repeat"
                                                        style={{
                                                            background: 'rgba(10, 14, 39, 0.5)',
                                                            border: '1px solid rgba(92, 225, 230, 0.2)',
                                                            color: 'white'
                                                        }}
                                                        aria-label="Filter by region"
                                                    >
                                                        <option value="" style={{ background: '#1e2139', color: 'white' }}>All</option>
                                                        {regions.map((region) => (
                                                            <option key={region} value={region} style={{ background: '#1e2139', color: 'white' }}>
                                                                {region}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Sort By */}
                                            <div>
                                                <label className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2" style={{ color: '#5CE1E6' }}>
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5CE1E6' }}></div>
                                                    SORT
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={sortBy}
                                                        onChange={(e) => setSortBy(e.target.value as any)}
                                                        className="appearance-none pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:ring-2 w-full text-sm font-semibold transition-all cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.75rem] bg-no-repeat"
                                                        style={{
                                                            background: 'rgba(10, 14, 39, 0.5)',
                                                            border: '1px solid rgba(92, 225, 230, 0.2)',
                                                            color: 'white'
                                                        }}
                                                        aria-label="Sort journeys"
                                                    >
                                                        <option value="newest" style={{ background: '#1e2139', color: 'white' }}>Newest</option>
                                                        <option value="price" style={{ background: '#1e2139', color: 'white' }}>Price ↑</option>
                                                        <option value="price-high" style={{ background: '#1e2139', color: 'white' }}>Price ↓</option>
                                                        <option value="duration" style={{ background: '#1e2139', color: 'white' }}>Duration</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compact Results Badge */}
                                        <div className="rounded-xl px-4 py-3 text-center" style={{
                                            background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)',
                                            boxShadow: '0 4px 20px rgba(61, 157, 163, 0.25)'
                                        }}>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-2xl font-black text-white">{filteredJourneys.length}</span>
                                                <span className="text-sm font-bold text-white uppercase tracking-wider">
                                                    {filteredJourneys.length === 1 ? 'JOURNEY' : 'JOURNEYS'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Compact Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setFilter('all')
                                                    setSelectedRegion('')
                                                    setSortBy('newest')
                                                    setTiming('upcoming')
                                                }}
                                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                style={{
                                                    background: 'rgba(10, 14, 39, 0.5)',
                                                    color: '#B0B7C3',
                                                    border: '1px solid rgba(92, 225, 230, 0.2)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(10, 14, 39, 0.7)';
                                                    e.currentTarget.style.borderColor = 'rgba(92, 225, 230, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(10, 14, 39, 0.5)';
                                                    e.currentTarget.style.borderColor = 'rgba(92, 225, 230, 0.2)';
                                                }}
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Reset
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsFilterOpen(false)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }}
                                                className="flex-[2] px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)',
                                                    color: 'white',
                                                    boxShadow: '0 4px 15px rgba(61, 157, 163, 0.3)'
                                                }}
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 lg:pb-10 min-h-[400px]">

                {/* Journeys Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-300"></div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64 text-red-400">
                        <p>{error}</p>
                    </div>
                ) : paginatedJourneys.length === 0 ? (
                    <div className="text-center py-14">
                        <h3 className="text-2xl font-bold text-white mb-2">No journeys found</h3>
                        <p className="mb-6" style={{ color: '#B0B7C3' }}>Try adjusting your filters</p>
                        <button
                            onClick={() => {
                                setFilter('all')
                                setSelectedRegion('')
                                setSortBy('newest')
                                setTiming('upcoming')
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="px-8 py-3 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)',
                                color: 'white',
                                boxShadow: '0 4px 15px rgba(61, 157, 163, 0.3)'
                            }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset Filters
                        </button>
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
                                        className="rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col border"
                                        style={{ background: '#1e2139', borderColor: 'rgba(92,225,230,0.15)', boxShadow: '0 12px 28px rgba(0,0,0,0.35)' }}
                                    >
                                        <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10"></div>
                                            <img
                                                src={journey.images[0] || '/images/placeholder.jpg'}
                                                alt={journey.title}
                                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 sm:top-5 right-4 sm:right-5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase shadow-lg z-20 border" style={{ background: 'rgba(30,33,57,0.9)', backdropFilter: 'blur(10px)', color: '#5CE1E6', borderColor: 'rgba(92,225,230,0.3)' }}>
                                                {journey.difficulty}
                                            </div>
                                        </div>
                                        <div className="p-6 sm:p-7 lg:p-8 flex flex-col grow">
                                            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold mb-3 sm:mb-4" style={{ color: '#5CE1E6' }}>
                                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                                <span className="tracking-wide truncate uppercase">{journey.location.region}, {journey.location.country}</span>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 transition-colors leading-tight line-clamp-2" style={{ color: 'white' }}>
                                                {journey.title}
                                            </h3>
                                            <p className="text-sm sm:text-base leading-relaxed line-clamp-3 mb-5 sm:mb-7 grow font-medium" style={{ color: '#B0B7C3' }}>
                                                {journey.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 sm:pt-5 border-t mt-auto" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                                <div className="flex items-center gap-2 sm:gap-2.5" style={{ color: '#B0B7C3' }}>
                                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                                    <span className="text-sm sm:text-base font-extrabold">{getDurationDays(journey.duration)} Days</span>
                                                </div>
                                                <div className="flex items-center gap-1 sm:gap-1.5 font-black" style={{ color: '#5CE1E6' }}>
                                                    {journey.price ? (
                                                        <>
                                                            <span className="text-xs font-bold uppercase">From</span>
                                                            <span className="text-xl sm:text-2xl">₹{journey.price.toLocaleString()}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xl sm:text-2xl">View Details</span>
                                                    )}
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
                            <div className="flex justify-center items-center gap-1.5 mt-7 sm:mt-8 lg:mt-10 flex-wrap">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    style={{ borderColor: 'rgba(92,225,230,0.2)', background: 'rgba(30,33,57,0.5)' }}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-4 h-4" style={{ color: '#B0B7C3' }} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                        style={currentPage === page
                                            ? { background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)', color: 'white', boxShadow: '0 4px 12px rgba(61, 157, 163, 0.3)' }
                                            : { border: '1px solid rgba(92,225,230,0.2)', color: '#B0B7C3', background: 'rgba(30,33,57,0.5)' }
                                        }
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    style={{ borderColor: 'rgba(92,225,230,0.2)', background: 'rgba(30,33,57,0.5)' }}
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-4 h-4" style={{ color: '#B0B7C3' }} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
