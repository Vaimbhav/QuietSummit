import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
    children: ReactNode
    className?: string
    hoverable?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({
    children,
    className = '',
    hoverable = true,
    padding = 'md'
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverable ? { y: -6, transition: { duration: 0.3 } } : {}}
            className={`bg-white rounded-2xl shadow-premium border border-neutral-100 ${paddingClasses[padding]} transition-all duration-300 hover:shadow-premium-lg ${className}`}
        >
            {children}
        </motion.div>
    )
}
