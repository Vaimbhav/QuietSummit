import { motion } from 'framer-motion'

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg'
    fullScreen?: boolean
}

export default function Loader({ size = 'md', fullScreen = false }: LoaderProps) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    }

    const loader = (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`border-4 border-primary-200 border-t-primary-600 rounded-full ${sizes[size]}`}
        />
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                {loader}
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center p-8">
            {loader}
        </div>
    )
}
