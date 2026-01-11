import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
    children: ReactNode
    className?: string
    hoverable?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'default' | 'luxury' | 'premium' | 'glass'
}

export default function Card({
    children,
    className = '',
    hoverable = true,
    padding = 'md',
    variant = 'default'
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
    }

    const variantClasses = {
        default: 'bg-white border border-neutral-100 shadow-luxury hover:shadow-luxury-lg',
        luxury: 'glass-luxury border-luxury shadow-luxury-lg hover:shadow-luxury-xl',
        premium: 'bg-linear-to-br from-white via-luxury-50 to-white border border-luxury-200 shadow-luxury-xl hover:shadow-luxury-2xl',
        glass: 'glass-effect border border-white/40 shadow-luxury hover:shadow-luxury-lg'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileHover={hoverable ? {
                y: -8,
                scale: 1.01,
                transition: { duration: 0.3, ease: 'easeOut' }
            } : {}}
            className={`rounded-3xl transition-all duration-300 overflow-hidden ${paddingClasses[padding]} ${variantClasses[variant]} ${hoverable ? 'hover-lift cursor-pointer' : ''} ${className}`}
        >
            {children}
        </motion.div>
    )
}

