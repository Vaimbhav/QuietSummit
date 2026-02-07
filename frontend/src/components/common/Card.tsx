import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
    children: ReactNode
    className?: string
    hoverable?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'default' | 'luxury' | 'premium' | 'glass' | 'dark'
    style?: React.CSSProperties
}

export default function Card({
    children,
    className = '',
    hoverable = true,
    padding = 'md',
    variant = 'default',
    style
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
    }

    const variantClasses = {
        default: 'bg-white border border-neutral-100 shadow-sm hover:shadow-md',
        luxury: 'bg-white border border-neutral-100 shadow-md hover:shadow-lg',
        premium: 'bg-white border border-neutral-100 shadow-md hover:shadow-lg',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg',
        dark: '' // No default classes for dark variant, allow full customization
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={hoverable ? { y: -4 } : {}}
            className={`rounded-2xl transition-all duration-200 ${paddingClasses[padding]} ${variantClasses[variant]} ${className}`}
            style={style}
        >
            {children}
        </motion.div>
    )
}

