import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Component to manage authentication state across the app
 * Handles token expiry notifications and auto-redirects
 */
export default function AuthStateManager() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleAuthExpired = () => {
            // Show a notification to the user
            const message = 'Your session has expired. Please login again.'

            // Check if we're not already on signup/login page
            const currentPath = window.location.pathname
            if (currentPath !== '/signup' && currentPath !== '/') {
                // Show alert (you can replace this with a toast notification)
                alert(message)

                // Store current path for redirect after re-login
                if (currentPath !== '/dashboard') {
                    localStorage.setItem('redirectAfterLogin', currentPath)
                }

                // Navigate to signup page
                navigate('/signup')
            }
        }

        // Listen for auth expiry events from axios interceptor
        window.addEventListener('auth:expired', handleAuthExpired)

        return () => {
            window.removeEventListener('auth:expired', handleAuthExpired)
        }
    }, [navigate])

    // This component doesn't render anything
    return null
}
