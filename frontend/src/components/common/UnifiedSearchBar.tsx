import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Mountain, Compass, Heart, MapPin, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type SearchCategory = 'stays' | 'pulse' | 'impact' | 'all'

export default function UnifiedSearchBar() {
    const [searchQuery, setSearchQuery] = useState('')
    const [category, setCategory] = useState<SearchCategory>('all')
    const [location, setLocation] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const navigate = useNavigate()

    const categories = [
        { id: 'all' as SearchCategory, label: 'All', icon: Search },
        { id: 'stays' as SearchCategory, label: 'Quiet Stays', icon: Mountain },
        { id: 'pulse' as SearchCategory, label: 'Experiences', icon: Compass },
        { id: 'impact' as SearchCategory, label: 'Stay & Give', icon: Heart },
    ]

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        // Navigate based on category
        const params = new URLSearchParams()
        if (searchQuery) params.append('q', searchQuery)
        if (location) params.append('location', location)

        switch (category) {
            case 'stays':
                navigate(`/homestays?${params.toString()}`)
                break
            case 'pulse':
                navigate(`/pulse?${params.toString()}`)
                break
            case 'impact':
                navigate(`/stay-and-give?${params.toString()}`)
                break
            default:
                // Search across all
                navigate(`/search?${params.toString()}`)
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
                {/* Main Search Container */}
                <div className="bg-dark-card rounded-3xl shadow-2xl border-2 border-dark-border overflow-hidden backdrop-blur-sm">
                    {/* Category Tabs */}
                    <div className="flex border-b border-dark-border bg-dark-light">
                        {categories.map((cat) => {
                            const Icon = cat.icon
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex-1 px-4 py-3 text-xs font-semibold transition-all relative ${category === cat.id
                                        ? 'text-primary-300 bg-dark-card'
                                        : 'text-white hover:text-primary-300 hover:bg-dark-card/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline text-xs">{cat.label}</span>
                                    </div>
                                    {category === cat.id && (
                                        <motion.div
                                            layoutId="activeCategory"
                                            className="absolute bottom-0 left-0 right-0 h-0.5"
                                            style={{ background: '#5CE1E6' }}
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Search Inputs */}
                    <div className="p-3 md:p-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            {/* Search Query */}
                            <div className="md:col-span-7">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Find your reset..."
                                        className="w-full pl-10 pr-4 py-3 text-xs md:text-sm rounded-xl font-medium text-white placeholder-neutral-500 transition-all"
                                        style={{ background: '#1a1d2e', border: '2px solid rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.3)' }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#5CE1E6'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                                        onMouseEnter={(e) => !document.activeElement || e.currentTarget !== document.activeElement ? e.currentTarget.style.borderColor = '#5CE1E6' : null}
                                        onMouseLeave={(e) => e.currentTarget !== document.activeElement ? e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' : null}
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="md:col-span-3">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Location"
                                        className="w-full pl-10 pr-4 py-3 text-xs md:text-sm rounded-xl font-medium text-white placeholder-neutral-500 transition-all"
                                        style={{ background: '#1a1d2e', border: '2px solid rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.3)' }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#5CE1E6'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                                        onMouseEnter={(e) => !document.activeElement || e.currentTarget !== document.activeElement ? e.currentTarget.style.borderColor = '#5CE1E6' : null}
                                        onMouseLeave={(e) => e.currentTarget !== document.activeElement ? e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' : null}
                                    />
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="w-full h-full px-4 py-3 font-bold rounded-xl text-xs md:text-sm inline-flex items-center justify-center gap-2 transition-all duration-200"
                                    style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27', border: '2px solid transparent' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <Search className="w-4 h-4" />
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Filters Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="mt-3 text-xs text-white hover:text-primary-300 font-medium transition-colors flex items-center gap-2"
                        >
                            <Calendar className="w-3 h-3" />
                            {showFilters ? 'Hide' : 'Show'} advanced filters
                        </button>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-dark-border"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-200 mb-1 block">
                                            Price Range
                                        </label>
                                        <select className="w-full px-2 py-2 pr-8 border-2 border-dark-border rounded-lg text-xs focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none font-semibold shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer appearance-none bg-dark-card text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.5rem] bg-no-repeat">
                                            <option>Any</option>
                                            <option>Under ₹5,000</option>
                                            <option>₹5,000 - ₹10,000</option>
                                            <option>₹10,000+</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-200 mb-1 block">
                                            Duration
                                        </label>
                                        <select className="w-full px-2 py-2 pr-8 border-2 border-dark-border rounded-lg text-xs focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none font-semibold shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer appearance-none bg-dark-card text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.5rem] bg-no-repeat">
                                            <option>Any</option>
                                            <option>Weekend</option>
                                            <option>Week</option>
                                            <option>Month+</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-200 mb-1 block">
                                            Silence Level
                                        </label>
                                        <select className="w-full px-2 py-2 pr-8 border-2 border-dark-border rounded-lg text-xs focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none font-semibold shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer appearance-none bg-dark-card text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.5rem] bg-no-repeat">
                                            <option>Any</option>
                                            <option>Moderate (3+)</option>
                                            <option>High (4+)</option>
                                            <option>Complete (5)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-200 mb-1 block">
                                            Connectivity
                                        </label>
                                        <select className="w-full px-2 py-2 pr-8 border-2 border-dark-border rounded-lg text-xs focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none font-semibold shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer appearance-none bg-dark-card text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.5rem] bg-no-repeat">
                                            <option>Any</option>
                                            <option>Minimal</option>
                                            <option>Moderate</option>
                                            <option>Strong WiFi</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-center text-xs text-neutral-400 mt-3">
                    Search across <span className="font-semibold text-primary-300">Quiet Stays</span>,{' '}
                    <span className="font-semibold text-primary-300">Experiences</span>, and{' '}
                    <span className="font-semibold text-primary-300">Impact Programs</span>
                </p>
            </form>
        </div>
    )
}
