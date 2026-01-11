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
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group cursor-pointer select-none'

    const variants = {
        primary: `
            bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 
            text-white 
            shadow-[0_4px_14px_0_rgba(74,139,112,0.39)]
            hover:shadow-[0_6px_20px_rgba(74,139,112,0.45)]
            hover:from-primary-500 hover:via-primary-400 hover:to-primary-500
            hover:-translate-y-0.5
            active:translate-y-0 active:shadow-[0_2px_8px_rgba(74,139,112,0.35)]
            border border-primary-500/20
        `,
        secondary: `
            bg-gradient-to-r from-accent-600 via-accent-500 to-accent-600 
            text-white 
            shadow-[0_4px_14px_0_rgba(90,125,114,0.39)]
            hover:shadow-[0_6px_20px_rgba(90,125,114,0.45)]
            hover:from-accent-500 hover:via-accent-400 hover:to-accent-500
            hover:-translate-y-0.5
            active:translate-y-0 active:shadow-[0_2px_8px_rgba(90,125,114,0.35)]
            border border-accent-500/20
        `,
        outline: `
            bg-white
            border-2 border-primary-500 
            text-primary-600 
            shadow-[0_2px_8px_rgba(74,139,112,0.08)]
            hover:bg-primary-50 
            hover:border-primary-600 
            hover:text-primary-700
            hover:shadow-[0_4px_12px_rgba(74,139,112,0.15)]
            hover:-translate-y-0.5
            active:translate-y-0 active:bg-primary-100
        `,
        ghost: `
            bg-transparent
            text-primary-600 
            hover:bg-primary-50/80
            hover:text-primary-700
            hover:-translate-y-0.5
            active:translate-y-0 active:bg-primary-100/80
        `,
        luxury: `
            bg-white
            text-primary-700 
            shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
            border border-neutral-200/60
            hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1)]
            hover:border-primary-200
            hover:-translate-y-0.5
            active:translate-y-0 active:shadow-[0_2px_10px_rgba(0,0,0,0.06)]
        `,
        premium: `
            bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 
            text-white 
            shadow-[0_8px_30px_-5px_rgba(74,139,112,0.5),0_4px_10px_-3px_rgba(74,139,112,0.3)]
            hover:shadow-[0_14px_40px_-5px_rgba(74,139,112,0.55),0_6px_15px_-3px_rgba(74,139,112,0.35)]
            hover:from-primary-500 hover:via-primary-400 hover:to-accent-500
            hover:-translate-y-1
            active:translate-y-0 active:shadow-[0_4px_15px_rgba(74,139,112,0.4)]
            border border-white/20
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
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Shimmer effect on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>

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

