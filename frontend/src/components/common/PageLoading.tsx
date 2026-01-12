import { motion } from 'framer-motion'

interface PageLoadingProps {
    message?: string
}

export default function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
    return (
        <div className="fixed inset-0 z-[9998] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-16 h-16 mx-auto mb-4"
                >
                    <div className="w-full h-full rounded-full border-4 border-primary-200 border-t-primary-600" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-neutral-600 font-medium"
                >
                    {message}
                </motion.p>
            </div>
        </div>
    )
}
