import { useEffect, useRef } from 'react'
import { refreshToken } from '../../services/api'

const AUTO_REFRESH_THRESHOLD = 10 * 60 * 1000 // Refresh when 10 minutes remaining
const CHECK_INTERVAL = 60 * 1000 // Check every minute
const WARNING_THRESHOLD = 5 * 60 * 1000 // Show warning when 5 minutes remaining

/**
 * SessionManager - Automatically refreshes auth tokens in the background
 * No user interaction required - tokens are refreshed silently
 * Shows subtle warnings before session expires
 */
export default function SessionManager() {
    const isRefreshing = useRef(false)
    const hasShownWarning = useRef(false)

    useEffect(() => {
        const handleLogout = () => {
            localStorage.removeItem('quietsummit_user')
            localStorage.removeItem('quietsummit_email')
            // Dispatch event so other components know
            window.dispatchEvent(new CustomEvent('auth:expired'))
            window.location.href = '/'
        }

        const checkAndRefreshSession = async () => {
            // Prevent concurrent refresh attempts
            if (isRefreshing.current) return

            const userStr = localStorage.getItem('quietsummit_user')
            if (!userStr) return

            try {
                const user = JSON.parse(userStr)
                if (!user.token) return

                // Decode token to get expiry
                const parts = user.token.split('.')
                if (parts.length !== 3) return

                const payload = JSON.parse(atob(parts[1]))
                const expiryTime = payload.exp * 1000
                const now = Date.now()
                const timeLeft = expiryTime - now

                // Token expired - logout
                if (timeLeft <= 0) {
                    handleLogout()
                    return
                }

                // Show warning if session is about to expire and no refresh token
                if (timeLeft <= WARNING_THRESHOLD && !user.refreshToken && !hasShownWarning.current) {
                    hasShownWarning.current = true
                    window.dispatchEvent(new CustomEvent('session:expiring', {
                        detail: { timeLeft }
                    }))
                }

                // Auto-refresh if within threshold and has refresh token
                if (timeLeft <= AUTO_REFRESH_THRESHOLD && user.refreshToken) {
                    isRefreshing.current = true

                    try {
                        const response = await refreshToken(user.refreshToken)

                        if (response.success) {
                            // Update stored tokens silently
                            const updatedUser = {
                                ...user,
                                token: response.data.token,
                                refreshToken: response.data.refreshToken,
                            }
                            localStorage.setItem('quietsummit_user', JSON.stringify(updatedUser))
                            hasShownWarning.current = false // Reset warning flag

                            // Dispatch event for other components
                            window.dispatchEvent(new Event('storage'))
                        }
                    } catch (error) {
                        // If refresh token is invalid/expired, logout
                        if ((error as any)?.response?.status === 401) {
                            handleLogout()
                        }
                    } finally {
                        isRefreshing.current = false
                    }
                }
            } catch (error) {
                console.error('Error checking session:', error)
            }
        }

        // Initial check
        checkAndRefreshSession()

        // Set up interval
        const interval = setInterval(checkAndRefreshSession, CHECK_INTERVAL)

        // Also check when tab becomes visible (user returns to tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkAndRefreshSession()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    // This component doesn't render anything - it's purely functional
    return null
}
