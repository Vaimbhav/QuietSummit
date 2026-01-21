import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
    message: string
    type?: ToastType
    duration?: number
    onClose: () => void
    isVisible: boolean
}

export default function Toast({
    message,
    type = 'info',
    duration = 5000,
    onClose,
    isVisible
}: ToastProps) {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [isVisible, duration, onClose])

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    }

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    }

    const iconColors = {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-amber-600',
        info: 'text-blue-600'
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-auto shadow-lg rounded-lg border-2 ${styles[type]} backdrop-blur-sm`}
                >
                    <div className="flex items-start gap-3 p-4">
                        <div className={iconColors[type]}>
                            {icons[type]}
                        </div>
                        <p className="flex-1 text-sm font-medium leading-relaxed">
                            {message}
                        </p>
                        <button
                            onClick={onClose}
                            className={`${iconColors[type]} hover:opacity-70 transition-opacity flex-shrink-0`}
                            aria-label="Close notification"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: duration / 1000, ease: 'linear' }}
                        className={`h-1 ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-amber-600' : 'bg-blue-600'}`}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
