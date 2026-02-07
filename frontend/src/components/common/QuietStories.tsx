import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Volume2, VolumeX, ShoppingCart, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface VideoStory {
    id: string
    videoUrl: string
    thumbnailUrl: string
    title: string
    location: string
    travelerName: string
    journeySlug?: string
    staySlug?: string
    guideId?: string
    duration: string
}

interface QuietStoriesProps {
    stories: VideoStory[]
}

export default function QuietStories({ stories }: QuietStoriesProps) {
    const [playingVideo, setPlayingVideo] = useState<string | null>(null)
    const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set(stories.map(s => s.id)))
    const [selectedStory, setSelectedStory] = useState<VideoStory | null>(null)
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

    const handleMouseEnter = (id: string) => {
        const video = videoRefs.current[id]
        if (video) {
            video.play().catch(err => console.log('Video play failed:', err))
            setPlayingVideo(id)
        }
    }

    const handleMouseLeave = (id: string) => {
        const video = videoRefs.current[id]
        if (video) {
            video.pause()
            video.currentTime = 0
            setPlayingVideo(null)
        }
    }

    const toggleMute = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const video = videoRefs.current[id]
        if (video) {
            const newMuted = new Set(mutedVideos)
            if (newMuted.has(id)) {
                newMuted.delete(id)
                video.muted = false
            } else {
                newMuted.add(id)
                video.muted = true
            }
            setMutedVideos(newMuted)
        }
    }

    const openStoryModal = (story: VideoStory) => {
        setSelectedStory(story)
        // Pause all videos
        Object.values(videoRefs.current).forEach(video => {
            if (video) video.pause()
        })
    }

    return (
        <div className="w-full">
            {/* Masonry Grid Layout */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {stories.map((story, index) => (
                    <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="break-inside-avoid mb-4"
                    >
                        <div
                            className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                            onMouseEnter={() => handleMouseEnter(story.id)}
                            onMouseLeave={() => handleMouseLeave(story.id)}
                            onClick={() => openStoryModal(story)}
                        >
                            {/* Video */}
                            <video
                                ref={(el) => (videoRefs.current[story.id] = el)}
                                src={story.videoUrl}
                                poster={story.thumbnailUrl}
                                loop
                                muted={mutedVideos.has(story.id)}
                                playsInline
                                className="w-full h-auto object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Play Icon (when not playing) */}
                            {playingVideo !== story.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                                    </div>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={(e) => toggleMute(story.id, e)}
                                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                                >
                                    {mutedVideos.has(story.id) ? (
                                        <VolumeX className="w-4 h-4 text-white" />
                                    ) : (
                                        <Volume2 className="w-4 h-4 text-white" />
                                    )}
                                </button>
                            </div>

                            {/* Info & CTA */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">
                                    {story.title}
                                </h3>
                                <p className="text-white/90 text-sm mb-3 drop-shadow-lg">
                                    {story.location} • {story.travelerName}
                                </p>

                                {/* Book This Journey Button */}
                                {story.journeySlug && (
                                    <Link
                                        to={`/journeys/${story.journeySlug}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button className="w-full px-4 py-2.5 bg-pine text-white rounded-xl font-semibold hover:bg-pine-dark transition-colors flex items-center justify-center gap-2 shadow-lg">
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>Book This Journey</span>
                                        </button>
                                    </Link>
                                )}
                            </div>

                            {/* Duration Badge */}
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                    {story.duration}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Full Screen Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setSelectedStory(null)}
                    >
                        <button
                            onClick={() => setSelectedStory(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                            aria-label="Close video modal"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                            <video
                                src={selectedStory.videoUrl}
                                controls
                                autoPlay
                                className="w-full rounded-2xl"
                            />
                            <div className="mt-6 text-center">
                                <h2 className="text-white text-2xl font-bold mb-2">
                                    {selectedStory.title}
                                </h2>
                                <p className="text-white/80 mb-6">
                                    {selectedStory.location} • {selectedStory.travelerName}
                                </p>
                                {selectedStory.journeySlug && (
                                    <Link to={`/journeys/${selectedStory.journeySlug}`}>
                                        <button className="px-8 py-3 bg-pine text-white rounded-xl font-bold hover:bg-pine-dark transition-colors">
                                            Book This Journey
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
