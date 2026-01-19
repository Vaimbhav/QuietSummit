import { useEffect, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@store/hooks'
import { setUser, clearUser } from '@store/slices/userSlice'

/**
 * Decode JWT token to check expiry (client-side only, not for security)
 */
const isTokenValid = (token: string): boolean => {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return false

        const payload = JSON.parse(atob(parts[1]))
        const expiry = payload.exp * 1000 // Convert to milliseconds

        // Check if token expires in more than 1 minute
        return Date.now() < expiry - 60000
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error validating token:', error)
        }
        return false
    }
}

/**
 * Custom hook to manage authentication state
 * Syncs localStorage with Redux store, validates tokens, and provides auth status
 */
export function useAuth() {
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.user)

    // Logout handler
    const logout = useCallback(() => {
        localStorage.removeItem('quietsummit_user')
        localStorage.removeItem('redirectAfterLogin')
        dispatch(clearUser())
    }, [dispatch])

    // Sync auth state from localStorage on mount and validate token
    useEffect(() => {
        const syncAuthState = () => {
            const storedUser = localStorage.getItem('quietsummit_user')

            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser)

                    // Check if token exists and is valid
                    if (userData.token && isTokenValid(userData.token)) {
                        dispatch(setUser({
                            email: userData.email,
                            name: userData.name,
                            role: userData.role,
                            isHost: userData.isHost,
                            token: userData.token,
                            isAuthenticated: true,
                        }))
                    } else {
                        // Token invalid or expired, clear auth
                        logout()
                    }
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.error('Error parsing stored user:', error)
                    }
                    logout()
                }
            }
        }

        // Initial sync on mount
        syncAuthState()

        // Listen for storage events (e.g., login in another tab)
        window.addEventListener('storage', syncAuthState)

        // Listen for token expiry from axios interceptor
        const handleAuthExpired = () => {
            logout()
        }
        window.addEventListener('auth:expired', handleAuthExpired)

        return () => {
            window.removeEventListener('storage', syncAuthState)
            window.removeEventListener('auth:expired', handleAuthExpired)
        }
    }, [dispatch, logout])

    // Periodic token validation check (every minute)
    useEffect(() => {
        const checkInterval = setInterval(() => {
            const storedUser = localStorage.getItem('quietsummit_user')
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser)
                    if (!userData.token || !isTokenValid(userData.token)) {
                        logout()
                    }
                } catch (error) {
                    logout()
                }
            }
        }, 60000) // Check every minute

        return () => clearInterval(checkInterval)
    }, [logout])

    // Check both localStorage and Redux for most up-to-date auth state
    const storedUser = localStorage.getItem('quietsummit_user')
    let isAuthenticated = false
    let currentUser = null

    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser)
            if (userData.token && isTokenValid(userData.token)) {
                isAuthenticated = true
                currentUser = userData
            }
        } catch (error) {
            // Invalid stored data
        }
    }

    // Prefer Redux state if available
    if (user.isAuthenticated && user.token && isTokenValid(user.token)) {
        isAuthenticated = true
        currentUser = {
            email: user.email,
            name: user.name,
            role: user.role,
            isHost: user.isHost,
            token: user.token,
        }
    }

    return {
        isAuthenticated,
        user: currentUser,
        email: user.email,
        name: user.name,
        logout,
    }
}
