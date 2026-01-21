import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/userSlice'
import { getMemberProfile, updateUserRole } from '@/services/api'
import Button from '@components/common/Button'
import { motion } from 'framer-motion'

export default function GoogleAuthSuccess() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const processingRef = useRef(false)

    // Role selection state
    const [showRoleSelection, setShowRoleSelection] = useState(false)
    const [isHostMode, setIsHostMode] = useState(false)
    const [isSubmittingRole, setIsSubmittingRole] = useState(false)

    useEffect(() => {
        const processAuth = async () => {
            // Prevent double execution in React Strict Mode
            if (processingRef.current) return
            processingRef.current = true

            try {
                const dataParam = searchParams.get('data')

                if (!dataParam) {
                    setError('Authentication failed - no data received')
                    setLoading(false)
                    return
                }

                // Parse minimal auth data (token, refreshToken, email, isNewUser)
                const authData = JSON.parse(decodeURIComponent(dataParam))

                if (!authData.token || !authData.email) {
                    setError('Invalid authentication data')
                    setLoading(false)
                    return
                }

                // Store tokens and email temporarily so API calls work
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
                        isAuthenticated: true,
                    }

                    // Update Redux/Storage with initial data
                    localStorage.setItem('quietsummit_user', JSON.stringify(fullUserData))
                    dispatch(setUser(fullUserData))

                    // If user is new, show role selection
                    if (authData.isNewUser) {
                        setLoading(false)
                        setShowRoleSelection(true)
                        return
                    }

                    // Otherwise, proceed with redirect
                    handleRedirect(fullUserData.role)
                } else {
                    setError('Failed to fetch user profile')
                    setLoading(false)
                }
            } catch (error) {
                console.error(error)
                setError('Authentication failed. Please try again.')
                setLoading(false)
            }
        }

        processAuth()
    }, [searchParams, navigate, dispatch])

    const handleRedirect = (role?: string) => {
        // Check for redirect path
        const redirectPath = localStorage.getItem('redirectAfterLogin')
        if (redirectPath) {
            localStorage.removeItem('redirectAfterLogin')

            // prevent members from being redirected to host pages
            if (role === 'member' && redirectPath.startsWith('/host')) {
                navigate('/dashboard')
                return
            }

            navigate(redirectPath)
        } else {
            // Default redirects based on role
            if (role === 'host') {
                navigate('/host/dashboard')
            } else if (role === 'admin') {
                navigate('/admin/dashboard')
            } else {
                navigate('/dashboard')
            }
        }
    }

    const handleRoleSubmit = async () => {
        setIsSubmittingRole(true)
        try {
            const response = await updateUserRole(isHostMode)
            if (response.success && response.data) {
                // Update with NEW token and role
                const updatedUser = {
                    ...response.data,
                    isAuthenticated: true,
                    // Ensure token is updated if backend provided a new one
                    token: response.data.token || JSON.parse(localStorage.getItem('quietsummit_user') || '{}').token
                }

                localStorage.setItem('quietsummit_user', JSON.stringify(updatedUser))
                dispatch(setUser(updatedUser))

                // Redirect using the smart handler
                handleRedirect(updatedUser.role)
            }
        } catch (err) {
            console.error(err)
            setError('Failed to set account type. Please try again.')
            setIsSubmittingRole(false)
        }
    }

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

    if (showRoleSelection) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12"
                >
                    <div className="text-center mb-10">
                        <div className="text-5xl mb-4">👋</div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-3">Welcome to QuietSummit!</h1>
                        <p className="text-lg text-neutral-600">
                            We're glad you're here. How would you like to use QuietSummit?
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        <div
                            onClick={() => setIsHostMode(false)}
                            className={`cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 ${!isHostMode
                                ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600 shadow-lg scale-[1.02]'
                                : 'border-neutral-100 bg-neutral-50 hover:border-primary-200 hover:bg-white hover:shadow-md'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-2xl ${!isHostMode ? 'bg-primary-100' : 'bg-white'}`}>
                                🌏
                            </div>
                            <div className="absolute top-4 right-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!isHostMode ? 'border-primary-600 bg-primary-600' : 'border-neutral-300'}`}>
                                    {(!isHostMode) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </div>
                            </div>
                            <h3 className={`font-bold text-lg mb-1 ${!isHostMode ? 'text-primary-900' : 'text-neutral-700'}`}>Member</h3>
                            <p className={`text-sm leading-relaxed ${!isHostMode ? 'text-primary-700' : 'text-neutral-500'}`}>
                                I want to discover and book unique journeys and homestays.
                            </p>
                        </div>

                        <div
                            onClick={() => setIsHostMode(true)}
                            className={`cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 ${isHostMode
                                ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600 shadow-lg scale-[1.02]'
                                : 'border-neutral-100 bg-neutral-50 hover:border-primary-200 hover:bg-white hover:shadow-md'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-2xl ${isHostMode ? 'bg-primary-100' : 'bg-white'}`}>
                                🏡
                            </div>
                            <div className="absolute top-4 right-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isHostMode ? 'border-primary-600 bg-primary-600' : 'border-neutral-300'}`}>
                                    {(isHostMode) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </div>
                            </div>
                            <h3 className={`font-bold text-lg mb-1 ${isHostMode ? 'text-primary-900' : 'text-neutral-700'}`}>Host</h3>
                            <p className={`text-sm leading-relaxed ${isHostMode ? 'text-primary-700' : 'text-neutral-500'}`}>
                                I want to list my property and host travelers.
                            </p>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full text-lg py-4 shadow-lg shadow-primary-500/20"
                        onClick={handleRoleSubmit}
                        isLoading={isSubmittingRole}
                    >
                        {isHostMode ? 'Setup My Host Profile →' : 'Start Searching →'}
                    </Button>
                </motion.div>
            </div>
        )
    }

    return null
}
