import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, MapPin, Award, Play, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '@components/common/SEO'

interface Guide {
    _id: string
    name: string
    slug: string
    bio: string
    storytellingFocus: string
    videoIntroUrl?: string
    profileImage?: string
    experience: {
        years: number
    }
    specializations: string[]
    regions: string[]
    languages: string[]
    rating: {
        average: number
        count: number
    }
    verified: boolean
}

export default function GuidesPage() {
    const [guides] = useState<Guide[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({
        region: 'all',
        specialization: 'all',
    })
    const [playingVideo, setPlayingVideo] = useState<string | null>(null)

    useEffect(() => {
        // Fetch guides from API
        // TODO: Replace with actual API call
        setLoading(false)
    }, [filter])

    const regions = [
        'All Regions',
        'Ladakh',
        'Spiti Valley',
        'Himachal Pradesh',
        'Uttarakhand',
        'Sikkim',
        'Kashmir',
    ]

    const specializations = [
        'All Specializations',
        'Mountain Trekking',
        'Cultural Tours',
        'Meditation & Yoga',
        'Photography',
        'Nature Walks',
    ]

    return (
        <>
            <SEO
                title="Quiet Guides - Meet Your Mountain Storytellers | QuietSummit"
                description="Connect with experienced local guides who bring depth, wisdom, and authentic stories to your mountain journey."
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
                                Quiet Guides
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-white/90 font-light leading-relaxed">
                                Meet the storytellers, wisdom keepers, and mountain experts who will transform your journey.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Filters */}
                <section className="py-5 md:py-6 bg-[#0f132f] border-b border-[#5ce1e6]/10">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Region */}
                            <select
                                value={filter.region}
                                onChange={(e) => setFilter({ ...filter, region: e.target.value })}
                                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm border-2 border-dark-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all font-semibold text-white bg-dark-card shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.75rem] md:bg-[center_right_1rem] bg-no-repeat pr-10 md:pr-12"
                                aria-label="Filter by region"
                            >
                                {regions.map((r) => (
                                    <option key={r} value={r.toLowerCase().replace(/\s+/g, '-')}>
                                        {r}
                                    </option>
                                ))}
                            </select>

                            {/* Specialization */}
                            <select
                                value={filter.specialization}
                                onChange={(e) => setFilter({ ...filter, specialization: e.target.value })}
                                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm border-2 border-dark-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all font-semibold text-white bg-dark-card shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.75rem] md:bg-[center_right_1rem] bg-no-repeat pr-10 md:pr-12"
                                aria-label="Filter by specialization"
                            >
                                {specializations.map((s) => (
                                    <option key={s} value={s.toLowerCase().replace(/\s+/g, '-')}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Guides Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin w-10 h-10 border-4 border-[#5CE1E6] border-t-transparent rounded-full mx-auto" />
                            </div>
                        ) : guides.length === 0 ? (
                            <div className="text-center py-20">
                                <Users className="w-14 h-14 text-[#5CE1E6]/60 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    No guides found
                                </h3>
                                <p className="text-[#B0B7C3]">
                                    Try adjusting your filters or check back soon.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {guides.map((guide, index) => (
                                    <motion.div
                                        key={guide._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="bg-[#1e2139] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#5ce1e6]/15 group">
                                            {/* Profile Image / Video */}
                                            <div className="relative h-80 overflow-hidden bg-[#0a0e27]">
                                                {playingVideo === guide._id && guide.videoIntroUrl ? (
                                                    <video
                                                        src={guide.videoIntroUrl}
                                                        controls
                                                        autoPlay
                                                        className="w-full h-full object-cover"
                                                        onEnded={() => setPlayingVideo(null)}
                                                    />
                                                ) : (
                                                    <>
                                                        <img
                                                            src={guide.profileImage || '/images/placeholder-guide.jpg'}
                                                            alt={guide.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        {guide.videoIntroUrl && (
                                                            <button
                                                                onClick={() => setPlayingVideo(guide._id)}
                                                                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <div className="w-16 h-16 rounded-full bg-[#0a0e27]/80 border border-[#5ce1e6]/30 flex items-center justify-center">
                                                                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                                                                </div>
                                                                <span className="absolute bottom-8 text-white text-sm font-semibold">
                                                                    Watch 30s intro
                                                                </span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {/* Verified Badge */}
                                                {guide.verified && (
                                                    <div className="absolute top-4 right-4 bg-[#10b981] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                        <Award className="w-3 h-3" />
                                                        Verified
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <h3 className="text-2xl font-serif font-bold text-white mb-2">
                                                    {guide.name}
                                                </h3>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-bold text-white">
                                                            {guide.rating.average.toFixed(1)}
                                                        </span>
                                                        <span className="text-sm text-[#B0B7C3]">
                                                            ({guide.rating.count} reviews)
                                                        </span>
                                                    </div>
                                                    <span className="text-[#B0B7C3]">•</span>
                                                    <span className="text-sm text-[#B0B7C3] font-medium">
                                                        {guide.experience.years}+ years
                                                    </span>
                                                </div>

                                                <p className="text-[#B0B7C3] text-sm mb-4 line-clamp-3">
                                                    {guide.storytellingFocus}
                                                </p>

                                                {/* Specializations */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {guide.specializations.slice(0, 3).map((spec) => (
                                                        <span
                                                            key={spec}
                                                            className="px-2 py-1 bg-[#0a0e27]/70 text-[#B0B7C3] text-xs font-medium rounded-lg border border-[#5ce1e6]/20"
                                                        >
                                                            {spec}
                                                        </span>
                                                    ))}
                                                    {guide.specializations.length > 3 && (
                                                        <span className="px-2 py-1 bg-[#0a0e27]/70 text-[#B0B7C3] text-xs font-medium rounded-lg border border-[#5ce1e6]/20">
                                                            +{guide.specializations.length - 3} more
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Regions */}
                                                <div className="flex items-center gap-2 text-sm text-[#B0B7C3] mb-4">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{guide.regions.slice(0, 2).join(', ')}</span>
                                                    {guide.regions.length > 2 && <span>+{guide.regions.length - 2}</span>}
                                                </div>

                                                <Link to={`/guides/${guide.slug}`}>
                                                    <button className="w-full px-6 py-3 font-bold rounded-xl transition-colors" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}>
                                                        View Profile
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
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
