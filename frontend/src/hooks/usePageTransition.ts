import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hook for handling page transitions with loading states
 * Provides smooth transitions between routes
 */
export function usePageTransition(duration: number = 300) {
    const [isTransitioning, setIsTransitioning] = useState(false)
    const location = useLocation()

    useEffect(() => {
        setIsTransitioning(true)
        const timer = setTimeout(() => {
            setIsTransitioning(false)
        }, duration)

        return () => clearTimeout(timer)
    }, [location.pathname, duration])

    return { isTransitioning }
}

/**
 * Hook to check if user returned from authentication flow
 * Useful for showing welcome messages or completing interrupted actions
 */
export function useAuthReturn() {
    const [justAuthenticated, setJustAuthenticated] = useState(false)
    const location = useLocation()

    useEffect(() => {
        // Check if user just logged in and was redirected
        const redirectPath = localStorage.getItem('redirectAfterLogin')
        if (redirectPath && location.pathname === redirectPath) {
            setJustAuthenticated(true)
            localStorage.removeItem('redirectAfterLogin')

            // Reset after a few seconds
            const timer = setTimeout(() => {
                setJustAuthenticated(false)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [location])

    return { justAuthenticated }
}
