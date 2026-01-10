import { useState } from 'react'
import JourneyCard, { JourneyCardProps } from './JourneyCard'
import { SkeletonCard } from '@components/common/Skeleton'
import Button from '@components/common/Button'
import { motion } from 'framer-motion'

interface JourneyListProps {
    journeys?: JourneyCardProps[]
    isLoading?: boolean
    showFilters?: boolean
}

export default function JourneyList({
    journeys = [],
    isLoading = false,
    showFilters = true
}: JourneyListProps) {
    const [filter, setFilter] = useState<'all' | 'easy' | 'moderate' | 'challenging'>('all')
    const [sortBy, setSortBy] = useState<'price' | 'duration' | 'popularity'>('popularity')

    const filteredJourneys = journeys.filter(journey =>
        filter === 'all' ? true : journey.difficulty === filter
    )

    const sortedJourneys = [...filteredJourneys].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price
        if (sortBy === 'duration') return a.duration.localeCompare(b.duration)
        return 0
    })

    return (
        <div className="space-y-8">
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-md"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Difficulty Filter */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Difficulty Level
                            </label>
                            <div className="flex gap-2">
                                {(['all', 'easy', 'moderate', 'challenging'] as const).map((level) => (
                                    <Button
                                        key={level}
                                        variant={filter === level ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setFilter(level)}
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="popularity">Popularity</option>
                                <option value="price">Price</option>
                                <option value="duration">Duration</option>
                            </select>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Journey Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : sortedJourneys.length > 0 ? (
                    sortedJourneys.map((journey) => (
                        <JourneyCard key={journey.id} {...journey} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">No journeys found</h3>
                        <p className="text-neutral-600">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    )
}
