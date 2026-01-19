import { useState, useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HealthCheckBanner() {
    const [isHealthy, setIsHealthy] = useState(true)
    const [showBanner, setShowBanner] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        checkHealth()
        // Check health every 5 minutes
        const interval = setInterval(checkHealth, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const checkHealth = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
            const response = await fetch(`${API_URL.replace('/api/v1', '')}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            const data = await response.json()
            const healthy = data.status === 'healthy' && data.database === 'connected'

            setIsHealthy(healthy)
            if (!healthy && !dismissed) {
                setShowBanner(true)
            } else if (healthy) {
                setShowBanner(false)
                setDismissed(false)
            }
        } catch (error) {
            // Backend unreachable
            setIsHealthy(false)
            if (!dismissed) {
                setShowBanner(true)
            }
        }
    }

    const handleDismiss = () => {
        setShowBanner(false)
        setDismissed(true)
    }

    return (
        <AnimatePresence>
            {showBanner && !isHealthy && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white shadow-lg"
                >
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">
                                    We're experiencing some technical issues. Some features may be unavailable. We're working on it!
                                </p>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="shrink-0 hover:bg-amber-600 p-1 rounded transition-colors"
                                aria-label="Dismiss banner"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
