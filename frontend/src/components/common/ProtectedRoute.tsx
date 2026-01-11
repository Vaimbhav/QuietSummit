import { ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Loader from './Loader'

interface ProtectedRouteProps {
    children: ReactNode
}

/**
 * Wrapper component for protected routes
 * Redirects to signup page if user is not authenticated
 * Shows loading state while checking authentication
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
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
                            if (Date.now() < expiry) {
                                setIsChecking(false)
                                return // User is authenticated
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error checking auth:', error)
                }
            }

            // Not authenticated - redirect
            setIsChecking(false)
            const currentPath = window.location.pathname + window.location.search
            localStorage.setItem('redirectAfterLogin', currentPath)
            navigate('/signup')
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
