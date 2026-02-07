import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function QuietBelieverCTA() {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)
    const location = useLocation()

    // Don't show on signup page or if dismissed
    const shouldShow = !location.pathname.includes('/signup') && !isDismissed

    useEffect(() => {
        // Check if user has dismissed this before (using localStorage)
        const dismissed = localStorage.getItem('quietBelieverDismissed')
        if (dismissed) {
            setIsDismissed(true)
            return
        }

        // Show after 5 seconds of page load
        const timer = setTimeout(() => {
            if (shouldShow) {
                setIsVisible(true)
            }
        }, 5000)

        return () => clearTimeout(timer)
    }, [shouldShow])

    // Show again when user scrolls down
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 500 && shouldShow && !isDismissed) {
                setIsVisible(true)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [shouldShow, isDismissed])

    const handleDismiss = () => {
        setIsVisible(false)
        setIsDismissed(true)
        // Remember dismissal for 7 days
        localStorage.setItem('quietBelieverDismissed', Date.now().toString())
    }

    return (
        <AnimatePresence>
            {isVisible && shouldShow && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50"
                >
                    {/* Floating CTA Button */}
                    <div className="relative">
                        {/* Pulse Animation Rings */}
                        <div className="absolute inset-0 hidden sm:block">
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 0, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="absolute inset-0 rounded-full"
                                style={{ background: '#2D4F1E' }}
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 0, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 0.5,
                                }}
                                className="absolute inset-0 rounded-full"
                                style={{ background: '#2D4F1E' }}
                            />
                        </div>

                        {/* Main Button */}
                        <Link to="/signup">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative text-white px-4 py-3 md:px-6 md:py-4 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 font-bold transition-colors text-sm md:text-base"
                                style={{ background: 'linear-gradient(135deg, #2D4F1E 0%, #254119 100%)' }}
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <Heart className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
                                </motion.div>
                                <span className="whitespace-nowrap hidden sm:inline">Become a Quiet Believer</span>
                                <span className="whitespace-nowrap sm:hidden">Join Us</span>
                            </motion.button>
                        </Link>

                        {/* Close Button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute -top-1 -right-1 md:-top-2 md:-right-2 p-1 md:p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-lg transition-colors"
                        >
                            <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>
                    </div>

                    {/* Tooltip - shows on hover, hidden on mobile */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="hidden lg:block absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
                    >
                        <p className="text-sm font-medium">
                            Join our community for exclusive journeys & inspiration ✨
                        </p>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                            <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-neutral-900" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
