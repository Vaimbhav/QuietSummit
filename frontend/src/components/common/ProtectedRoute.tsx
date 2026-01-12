import { ReactNode, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Loader from './Loader'

interface ProtectedRouteProps {
    children: ReactNode
    fallbackPath?: string
}

/**
 * Wrapper component for protected routes
 * Redirects to signup/login if user is not authenticated
 * Shows loading state while checking authentication
 * Stores current path for post-login redirect
 */
export default function ProtectedRoute({ children, fallbackPath = '/signup' }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Check auth state from localStorage directly to avoid race conditions
        const checkAuth = () => {
            const storedUser = localStorage.getItem('quietsummit_user')

            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser)
                    if (userData.token) {
                        // Validate token hasn't expired
                        const parts = userData.token.split('.')
                        if (parts.length === 3) {
                            const payload = JSON.parse(atob(parts[1]))
                            const expiry = payload.exp * 1000
                            if (Date.now() < expiry - 60000) { // 1 min buffer
                                setIsChecking(false)
                                return // User is authenticated
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error checking auth:', error)
                }
            }

            // Not authenticated - redirect and save current location
            setIsChecking(false)
            const redirectUrl = location.pathname + location.search + location.hash
            localStorage.setItem('redirectAfterLogin', redirectUrl)

            // Dispatch custom event for other components to react
            window.dispatchEvent(new CustomEvent('auth:required', {
                detail: { redirectUrl }
            }))

            navigate(fallbackPath, { replace: true })
        }

        checkAuth()
    }, [navigate])

    // Also react to auth state changes
    useEffect(() => {
        if (!isChecking && !isAuthenticated) {
            const currentPath = window.location.pathname + window.location.search
            localStorage.setItem('redirectAfterLogin', currentPath)
            navigate('/signup')
        }
    }, [isAuthenticated, isChecking, navigate])

    // Show loading state while checking auth
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    // Don't render protected content if not authenticated
    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
