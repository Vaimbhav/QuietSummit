import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mountain, Filter, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '@components/common/SEO'

interface Pulse {
    _id: string
    title: string
    slug: string
    shortDescription: string
    perspectiveType: string
    difficulty: string
    duration: {
        days: number
        nights: number
    }
    location: {
        region: string
        nearestCity: string
    }
    pricing: {
        basePrice: number
        currency: string
    }
    images: string[]
    rating: {
        average: number
        count: number
    }
    featured: boolean
}

export default function PulsePage() {
    const [pulses] = useState<Pulse[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({
        perspective: 'all',
        difficulty: 'all',
        region: 'all',
    })

    useEffect(() => {
        // Fetch pulses from API
        // TODO: Replace with actual API call
        setLoading(false)
    }, [filter])

    const perspectives = [
        { value: 'all', label: 'All Experiences' },
        { value: 'Meditative', label: 'Meditative' },
        { value: 'Physical', label: 'Physical' },
        { value: 'Educational', label: 'Educational' },
        { value: 'Creative', label: 'Creative' },
        { value: 'Spiritual', label: 'Spiritual' },
    ]

    const difficulties = [
        { value: 'all', label: 'All Levels' },
        { value: 'easy', label: 'Easy' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'challenging', label: 'Challenging' },
        { value: 'extreme', label: 'Extreme' },
    ]

    return (
        <>
            <SEO
                title="Quiet Pulse - Transformative Experiences | QuietSummit"
                description="Discover transformative treks and experiences in the mountains. From meditative walks to challenging climbs, find your perfect mountain adventure."
            />

            <div className="min-h-screen bg-[#0a0e27] text-white">
                {/* Hero Section */}
                <section
                    className="relative py-10 md:py-14 lg:py-16 text-white overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)'
                    }}
                >
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
                    </div>

                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl"
                        >
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 md:mb-4">
                                Quiet Pulse
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-white/90 font-light leading-relaxed">
                                Transformative experiences designed to reset your rhythm and reconnect with nature.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Filters */}
                <section className="py-5 md:py-6 bg-[#0f132f] border-b border-[#5ce1e6]/10">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4">
                            <div className="flex items-center gap-2 text-primary-300 mb-2 md:mb-0">
                                <Filter className="w-4 h-4" />
                                <span className="font-bold text-xs md:text-sm">Filters:</span>
                            </div>

                            {/* Perspective Type */}
                            <select
                                value={filter.perspective}
                                onChange={(e) => setFilter({ ...filter, perspective: e.target.value })}
                                className="flex-1 md:flex-none min-w-0 md:min-w-[200px] px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm border-2 border-dark-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all font-semibold text-white bg-dark-card shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.75rem] md:bg-[center_right_1rem] bg-no-repeat pr-10 md:pr-12"
                                aria-label="Filter by perspective type"
                            >
                                {perspectives.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>

                            {/* Difficulty */}
                            <select
                                value={filter.difficulty}
                                onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                                className="flex-1 md:flex-none min-w-0 md:min-w-[200px] px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm border-2 border-dark-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all font-semibold text-white bg-dark-card shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.75rem] md:bg-[center_right_1rem] bg-no-repeat pr-10 md:pr-12"
                                aria-label="Filter by difficulty level"
                            >
                                {difficulties.map((d) => (
                                    <option key={d.value} value={d.value}>
                                        {d.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Pulses Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin w-10 h-10 border-4 border-[#5CE1E6] border-t-transparent rounded-full mx-auto" />
                            </div>
                        ) : pulses.length === 0 ? (
                            <div className="text-center py-20">
                                <Mountain className="w-14 h-14 text-[#5CE1E6]/60 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    No experiences found
                                </h3>
                                <p className="text-[#B0B7C3]">
                                    Try adjusting your filters or check back soon for new experiences.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pulses.map((pulse, index) => (
                                    <motion.div
                                        key={pulse._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link to={`/pulse/${pulse.slug}`}>
                                            <div className="bg-[#1e2139] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#5ce1e6]/15 group">
                                                {/* Image */}
                                                <div className="relative h-64 overflow-hidden">
                                                    <img
                                                        src={pulse.images[0]}
                                                        alt={pulse.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                                    {/* Badges */}
                                                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                        <span className="px-3 py-1 bg-[#0a0e27]/80 text-white text-xs font-bold rounded-full border border-[#5ce1e6]/30">
                                                            {pulse.perspectiveType}
                                                        </span>
                                                        <span className="px-3 py-1 bg-[#0a0e27]/70 backdrop-blur-sm text-white text-xs font-bold rounded-full capitalize border border-[#5ce1e6]/20">
                                                            {pulse.difficulty}
                                                        </span>
                                                    </div>

                                                    {/* Duration */}
                                                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                        {pulse.duration.days}D/{pulse.duration.nights}N
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6">
                                                    <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-[#5CE1E6] transition-colors">
                                                        {pulse.title}
                                                    </h3>
                                                    <p className="text-[#B0B7C3] text-sm mb-4 line-clamp-2">
                                                        {pulse.shortDescription}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-sm text-[#B0B7C3] mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{pulse.location.region}</span>
                                                        </div>
                                                        {pulse.rating.count > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-yellow-500">★</span>
                                                                <span className="font-semibold text-white">
                                                                    {pulse.rating.average.toFixed(1)}
                                                                </span>
                                                                <span>({pulse.rating.count})</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-[#5ce1e6]/15">
                                                        <div>
                                                            <span className="text-2xl font-bold text-white">
                                                                ₹{pulse.pricing.basePrice.toLocaleString()}
                                                            </span>
                                                            <span className="text-sm text-[#B0B7C3]"> /person</span>
                                                        </div>
                                                        <button className="px-6 py-2 font-semibold rounded-xl transition-colors" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}>
                                                            Explore
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    )
}
