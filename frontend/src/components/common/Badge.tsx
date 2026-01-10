import { ReactNode } from 'react'

interface BadgeProps {
    children: ReactNode
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
    size?: 'sm' | 'md'
}

export default function Badge({
    children,
    variant = 'default',
    size = 'md'
}: BadgeProps) {
    const variants = {
        default: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
        success: 'bg-green-100 text-green-700 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        danger: 'bg-red-100 text-red-700 hover:bg-red-200'
    }

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm'
    }

    return (
        <span className={`inline-flex items-center rounded-full font-medium transition-colors ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    )
}
