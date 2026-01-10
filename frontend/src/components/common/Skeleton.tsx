interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
}

export default function Skeleton({
    className = '',
    variant = 'rectangular'
}: SkeletonProps) {
    const variants = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg'
    }

    return (
        <div className={`animate-pulse bg-neutral-200 ${variants[variant]} ${className}`} />
    )
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>
        </div>
    )
}
