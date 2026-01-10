import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
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
    const baseClasses = 'inline-flex items-center justify-center font-bold rounded-lg md:rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.03] active:scale-[0.97] transform'

    const variants = {
        primary: 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white hover:from-primary-700 hover:via-primary-600 hover:to-accent-700 shadow-lg hover:shadow-2xl hover:shadow-primary-500/50',
        secondary: 'bg-gradient-to-r from-accent-600 to-accent-700 text-white hover:from-accent-700 hover:to-accent-800 shadow-lg hover:shadow-2xl hover:shadow-accent-500/50',
        outline: 'border-2 border-primary-600 text-primary-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 hover:border-primary-700 hover:text-primary-800 hover:shadow-lg',
        ghost: 'text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 hover:text-primary-700'
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    }

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && leftIcon && <span className="mr-2 flex items-center shrink-0">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2 flex items-center shrink-0">{rightIcon}</span>}
        </button>
    )
}
