import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastProvider'

/**
 * Component to manage authentication state across the app
 * Handles token expiry notifications and auto-redirects with toast notifications
 */
export default function AuthStateManager() {
    const navigate = useNavigate()
    const { showWarning, showInfo } = useToast()

    useEffect(() => {
        const handleAuthExpired = () => {
            // Show a toast notification to the user
            showWarning('Your session has expired. Please login again.')

            // Check if we're not already on signup/login page
            const currentPath = window.location.pathname
            if (currentPath !== '/signup' && currentPath !== '/') {
                // Store current path for redirect after re-login
                if (currentPath !== '/dashboard') {
                    localStorage.setItem('redirectAfterLogin', currentPath)
                }

                // Navigate to signup page after a short delay
                setTimeout(() => {
                    navigate('/signup')
                }, 1000)
            }
        }

        const handleAuthRequired = (event: Event) => {
            const customEvent = event as CustomEvent
            const redirectUrl = customEvent.detail?.redirectUrl

            showInfo('Please login to continue')

            if (redirectUrl) {
                localStorage.setItem('redirectAfterLogin', redirectUrl)
            }
        }

        // Listen for auth expiry events from axios interceptor
        window.addEventListener('auth:expired', handleAuthExpired)
        window.addEventListener('auth:required', handleAuthRequired)

        return () => {
            window.removeEventListener('auth:expired', handleAuthExpired)
            window.removeEventListener('auth:required', handleAuthRequired)
        }
    }, [navigate, showWarning, showInfo])

    // This component doesn't render anything
    return null
}
