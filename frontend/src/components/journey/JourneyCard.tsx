import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from '@components/common/Badge'

export interface JourneyCardProps {
    id: string
    title: string
    description: string
    duration: string
    price: number
    image?: string
    location: string
    difficulty?: 'easy' | 'moderate' | 'challenging'
    tags?: string[]
}

export default function JourneyCard({
    id,
    title,
    description,
    duration,
    price,
    image,
    location,
    difficulty = 'moderate',
    tags = []
}: JourneyCardProps) {
    const difficultyColors = {
        easy: 'success' as const,
        moderate: 'warning' as const,
        challenging: 'danger' as const
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-shadow hover:shadow-2xl"
        >
            {/* Image */}
            <Link to={`/journeys/${id}`}>
                <div className="relative h-56 bg-linear-to-br from-primary-100 via-accent-100 to-primary-200 overflow-hidden">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                            🏔️
                        </div>
                    )}
                    <div className="absolute top-4 right-4">
                        <Badge variant={difficultyColors[difficulty]} size="md">
                            {difficulty}
                        </Badge>
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-6 flex flex-col grow">
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{location}</span>
                </div>

                <Link to={`/journeys/${id}`}>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3 hover:text-primary-600 transition-colors">
                        {title}
                    </h3>
                </Link>

                <p className="text-neutral-600 mb-4 grow line-clamp-3">
                    {description}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="default" size="sm">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{duration}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-neutral-500">From</div>
                        <div className="text-2xl font-bold text-primary-600">${price}</div>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    to={`/journeys/${id}`}
                    className="mt-4 w-full px-4 py-3 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                    View Details
                </Link>
            </div>
        </motion.div>
    )
}
