import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'luxury' | 'premium'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    isLoading?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    children: ReactNode
}

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'

    const variants = {
        primary: `
            bg-primary-600
            text-white 
            shadow-sm
            hover:shadow-md
            hover:bg-primary-700
        `,
        secondary: `
            bg-white
            text-neutral-900
            border border-neutral-200
            shadow-sm
            hover:shadow-md
            hover:bg-neutral-50
        `,
        outline: `
            bg-transparent
            border-2 border-primary-600
            text-primary-600 
            hover:bg-primary-50
        `,
        ghost: `
            bg-transparent
            text-primary-600 
            hover:bg-primary-50
        `,
        luxury: `
            bg-white
            text-primary-700 
            shadow-md
            border border-neutral-200
            hover:shadow-lg
            hover:border-primary-200
        `,
        premium: `
            bg-primary-600
            text-white 
            shadow-md
            hover:shadow-lg
            hover:bg-primary-700
        `
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm gap-1.5',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
        xl: 'px-8 py-4 text-lg gap-2.5'
    }

    return (
        <button
            {...props}
            type={props.type || "button"}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
        >
            {/* Shimmer effect on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"></span>

            {isLoading && (
                <svg className="animate-spin h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && leftIcon && <span className="flex items-center shrink-0 relative z-10">{leftIcon}</span>}
            <span className="relative z-10 tracking-wide">{children}</span>
            {!isLoading && rightIcon && <span className="flex items-center shrink-0 relative z-10 group-hover:translate-x-0.5 transition-transform duration-200">{rightIcon}</span>}
        </button>
    )
}

