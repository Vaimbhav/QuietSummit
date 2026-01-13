import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/userSlice'
import { getMemberProfile } from '@/services/api'

export default function GoogleAuthSuccess() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const processAuth = async () => {
            try {
                const dataParam = searchParams.get('data')

                if (!dataParam) {
                    setError('Authentication failed - no data received')
                    setLoading(false)
                    return
                }

                // Parse minimal auth data (token, refreshToken, email)
                const authData = JSON.parse(decodeURIComponent(dataParam))

                if (!authData.token || !authData.email) {
                    setError('Invalid authentication data')
                    setLoading(false)
                    return
                }

                // Store tokens and email temporarily
                const tempUserData = {
                    email: authData.email,
                    token: authData.token,
                    refreshToken: authData.refreshToken,
                }
                localStorage.setItem('quietsummit_user', JSON.stringify(tempUserData))

                // Fetch full profile using the token
                const profileResponse = await getMemberProfile(authData.email)

                if (profileResponse.success && profileResponse.data) {
                    // Update with full user data
                    const fullUserData = {
                        ...profileResponse.data,
                        token: authData.token,
                        refreshToken: authData.refreshToken,
                    }

                    localStorage.setItem('quietsummit_user', JSON.stringify(fullUserData))
                    dispatch(setUser(fullUserData))

                    // Check for redirect path
                    const redirectPath = localStorage.getItem('redirectAfterLogin')
                    if (redirectPath) {
                        localStorage.removeItem('redirectAfterLogin')
                        navigate(redirectPath)
                    } else {
                        navigate('/dashboard')
                    }
                } else {
                    setError('Failed to fetch user profile')
                    setLoading(false)
                }
            } catch (error) {
                setError('Authentication failed. Please try again.')
                setLoading(false)
            }
        }

        processAuth()
    }, [searchParams, navigate, dispatch])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Completing authentication...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-600 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Authentication Error</h2>
                    <p className="text-neutral-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Return to Sign Up
                    </button>
                </div>
            </div>
        )
    }

    return null
}
