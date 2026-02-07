import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search as SearchIcon, Mountain, Compass, Heart, Loader2 } from 'lucide-react'
import SEO from '@components/common/SEO'

type SearchResult = {
    id: string
    type: 'stay' | 'experience' | 'impact'
    title: string
    description: string
    location: string
    image: string
    price?: string
    url: string
}

export default function SearchPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [location, setLocation] = useState(searchParams.get('location') || '')

    useEffect(() => {
        performSearch()
    }, [searchParams])

    const performSearch = async () => {
        setLoading(true)
        try {
            // TODO: Replace with actual API call
            // Simulating search results
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Mock results based on query
            const mockResults: SearchResult[] = []

            if (!query && !location) {
                // No search query - show popular options
                mockResults.push(
                    {
                        id: '1',
                        type: 'stay',
                        title: 'Mountain View Homestay',
                        description: 'Experience authentic Himalayan hospitality',
                        location: 'Himachal Pradesh',
                        image: '/images/placeholder.jpg',
                        price: '₹2,500/night',
                        url: '/homestays/mountain-view'
                    },
                    {
                        id: '2',
                        type: 'experience',
                        title: 'Dawn Meditation Trek',
                        description: 'Start your day with a guided meditation hike',
                        location: 'Uttarakhand',
                        image: '/images/placeholder.jpg',
                        price: '₹1,500',
                        url: '/pulse'
                    },
                    {
                        id: '3',
                        type: 'impact',
                        title: 'Stay & Give Program',
                        description: 'Long-term residency with community impact',
                        location: 'Various Locations',
                        image: '/images/placeholder.jpg',
                        url: '/stay-and-give'
                    }
                )
            }

            setResults(mockResults)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query) params.append('q', query)
        if (location) params.append('location', location)
        navigate(`/search?${params.toString()}`)
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'stay':
                return Mountain
            case 'experience':
                return Compass
            case 'impact':
                return Heart
            default:
                return SearchIcon
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'stay':
                return 'Quiet Stay'
            case 'experience':
                return 'Experience'
            case 'impact':
                return 'Impact Program'
            default:
                return type
        }
    }

    return (
        <>
            <SEO
                title={`Search Results${query ? ` for "${query}"` : ''} | QuietSummit`}
                description="Search for mountain retreats, experiences, and impact programs across the Himalayas."
            />

            <div className="min-h-screen bg-dark">
                {/* Search Header */}
                <section className="bg-dark-light border-b border-dark-border py-5 md:py-6">
                    <div className="container mx-auto px-4 md:px-6">
                        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                                <div className="md:col-span-7">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search for stays, experiences..."
                                            className="input-premium w-full pl-11 pr-4 py-2.5 md:py-3 text-xs md:text-sm rounded-lg md:rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Location"
                                        className="input-premium w-full px-4 py-2.5 md:py-3 text-xs md:text-sm rounded-lg md:rounded-xl"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        className="w-full h-full px-6 py-3.5 md:py-4 text-sm md:text-base text-white font-bold rounded-xl md:rounded-2xl transition-all hover:shadow-lg active:scale-95"
                                        style={{ background: 'linear-gradient(135deg, #2D4F1E 0%, #254119 100%)' }}
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Results */}
                <section className="py-8 md:py-12">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-5xl mx-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-12 h-12 text-pine animate-spin mb-4" />
                                    <p className="text-neutral-600">Searching...</p>
                                </div>
                            ) : results.length > 0 ? (
                                <>
                                    <h2 className="text-xl md:text-2xl font-serif font-bold text-neutral-900 mb-6 md:mb-8">
                                        {query || location ? `Search Results` : 'Popular Options'}
                                        {query && <span className="text-pine"> for "{query}"</span>}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                        {results.map((result) => {
                                            const Icon = getTypeIcon(result.type)
                                            return (
                                                <motion.a
                                                    key={result.id}
                                                    href={result.url}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group bg-dark-card rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100"
                                                >
                                                    <div className="aspect-video bg-neutral-200 relative overflow-hidden">
                                                        <img
                                                            src={result.image}
                                                            alt={result.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2.5 py-1 md:px-3 md:py-1 bg-dark-light border border-dark-border rounded-full text-xs font-semibold text-pine flex items-center gap-1">
                                                            <Icon className="w-3 h-3" />
                                                            <span className="hidden sm:inline">{getTypeLabel(result.type)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 md:p-6">
                                                        <h3 className="text-base md:text-lg font-serif font-bold text-neutral-900 mb-2 group-hover:text-pine transition-colors">
                                                            {result.title}
                                                        </h3>
                                                        <p className="text-xs md:text-sm text-neutral-600 mb-3">
                                                            {result.description}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-neutral-500">
                                                                📍 {result.location}
                                                            </span>
                                                            {result.price && (
                                                                <span className="text-xs md:text-sm font-bold text-pine">
                                                                    {result.price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.a>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 md:py-20 px-4">
                                    <SearchIcon className="w-12 h-12 md:w-16 md:h-16 text-neutral-300 mx-auto mb-4" />
                                    <h2 className="text-xl md:text-2xl font-serif font-bold text-neutral-900 mb-2">
                                        No Results Found
                                    </h2>
                                    <p className="text-sm md:text-base text-neutral-600 mb-6 md:mb-8">
                                        Try adjusting your search terms or explore our categories
                                    </p>
                                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4">
                                        <a
                                            href="/homestays"
                                            className="px-6 py-3 text-sm md:text-base font-semibold rounded-xl transition-all hover:shadow-lg active:scale-95 text-white"
                                            style={{ background: 'linear-gradient(135deg, #2D4F1E 0%, #254119 100%)' }}
                                        >
                                            Browse Stays
                                        </a>
                                        <a
                                            href="/pulse"
                                            className="px-6 py-3 text-sm md:text-base border-2 border-pine text-pine font-semibold rounded-xl hover:bg-pine hover:text-white transition-all active:scale-95"
                                        >
                                            View Experiences
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
