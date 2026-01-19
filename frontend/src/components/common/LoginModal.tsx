import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, CheckCircle, AlertCircle, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Input from './Input'
import Button from './Button'
import { loginMember, getGoogleAuthUrl } from '../../services/api'
import { useAppDispatch } from '@store/hooks'
import { setUser } from '@store/slices/userSlice'

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void // Callback after successful login
    showCloseButton?: boolean // Whether to show close button (false for required auth)
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [step, setStep] = useState<'login' | 'forgot'>('login')
    const [resetEmail, setResetEmail] = useState('')
    const [resetSent, setResetSent] = useState(false)
    const dispatch = useAppDispatch()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Validate inputs
            if (!email.trim() || !password.trim()) {
                setError('Please enter both email and password')
                setIsLoading(false)
                return
            }

            const response = await loginMember(email, password)

            // Store user data with token in Redux
            dispatch(setUser({
                email: response.data.email,
                name: response.data.name,
                role: response.data.role,
                isHost: response.data.isHost,
                token: response.data.token,
                isAuthenticated: true,
            }))

            // Store in localStorage with additional metadata
            const userData = {
                email: response.data.email,
                name: response.data.name,
                role: response.data.role,
                isHost: response.data.isHost,
                token: response.data.token,
                refreshToken: response.data.refreshToken,
                id: response.data.id,
                phone: response.data.phone,
                interests: response.data.interests,
                subscribeToNewsletter: response.data.subscribeToNewsletter,
                status: response.data.status,
                memberSince: response.data.memberSince,
                rememberMe: rememberMe,
                loginTime: new Date().toISOString(),
            }
            localStorage.setItem('quietsummit_user', JSON.stringify(userData))
            if (rememberMe) {
                localStorage.setItem('quietsummit_email', email)
            }

            setSuccess(true)

            // Dispatch storage event for other tabs to sync
            window.dispatchEvent(new Event('storage'))

            setTimeout(() => {
                // Check if onSuccess callback is provided (for BookingGuard)
                if (onSuccess) {
                    onSuccess()
                    onClose()
                    return
                }

                // Check if there's a redirect path stored
                const redirectPath = localStorage.getItem('redirectAfterLogin')
                if (redirectPath) {
                    localStorage.removeItem('redirectAfterLogin')
                    window.location.href = redirectPath
                } else {
                    window.location.href = '/dashboard'
                }
            }, 1500)
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to login. Please try again.'

            // Check if it's a rate limit error (429)
            if (err.response?.status === 429) {
                setError('Too many login attempts. Please try again in 15 minutes.')
            } else {
                setError(errorMsg)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (!resetEmail.trim()) {
                setError('Please enter your email address')
                setIsLoading(false)
                return
            }

            // Here you would call your password reset API
            // For now, we'll show a success message
            setResetSent(true)
            setTimeout(() => {
                setStep('login')
                setResetSent(false)
                setResetEmail('')
            }, 3000)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to process password reset')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setEmail('')
        setPassword('')
        setError(null)
        setSuccess(false)
        setStep('login')
        setResetEmail('')
        setResetSent(false)
        setRememberMe(false)
        setShowPassword(false)
        onClose()
    }

    const handleGoogleLogin = () => {
        const googleAuthUrl = getGoogleAuthUrl()
        window.location.href = googleAuthUrl
    }

    // Load remembered email on mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('quietsummit_email')
        if (rememberedEmail) {
            setEmail(rememberedEmail)
            setRememberMe(true)
        }
    }, [])
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose()
            }
        }

        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen])

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-[10001] p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-luxury rounded-4xl shadow-luxury-2xl max-w-md w-full p-6 sm:p-8 relative pointer-events-auto border-luxury"
                        >
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: 'spring' }}
                                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                                        Welcome Back! 🎉
                                    </h3>
                                    <p className="text-neutral-600">
                                        Welcome to QuietSummit! Your journey awaits...
                                    </p>
                                </motion.div>
                            ) : resetSent ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: 'spring' }}
                                        className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <Mail className="w-10 h-10 text-blue-600" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                                        Check Your Email
                                    </h3>
                                    <p className="text-neutral-600 mb-4">
                                        We've sent password reset instructions to {resetEmail}
                                    </p>
                                    <p className="text-sm text-neutral-500">
                                        Redirecting to login...
                                    </p>
                                </motion.div>
                            ) : step === 'login' ? (
                                <>
                                    <div className="text-center mb-5">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, type: 'spring' }}
                                            className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
                                        >
                                            <Lock className="w-7 h-7 text-white" />
                                        </motion.div>
                                        <h2 className="text-2xl font-black text-neutral-900 mb-1">
                                            Welcome Back
                                        </h2>
                                        <p className="text-neutral-600 text-sm">
                                            Enter your credentials to access your account
                                        </p>
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            leftIcon={
                                                <Mail className="w-5 h-5" />
                                            }
                                        />

                                        <div className="relative">
                                            <Input
                                                label="Password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-12 text-neutral-500 hover:text-neutral-700"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Remember Me & Forgot Password */}
                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 rounded border-neutral-300"
                                                />
                                                <span className="text-neutral-600">Remember me</span>
                                            </label>
                                            <Link
                                                to="/forgot-password"
                                                onClick={() => onClose()}
                                                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3"
                                            >
                                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                                <p className="text-red-700 text-sm">{error}</p>
                                            </motion.div>
                                        )}

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            isLoading={isLoading}
                                        >
                                            {isLoading ? 'Logging in...' : 'Login'}
                                        </Button>
                                    </form>

                                    <div className="mt-5">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-neutral-200"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-4 bg-white text-neutral-500">Or continue with</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGoogleLogin}
                                            type="button"
                                            className="mt-4 w-full flex items-center justify-center gap-3 px-5 py-2.5 bg-white border border-neutral-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-neutral-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 font-medium text-neutral-700"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="#4285F4"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            Continue with Google
                                        </button>
                                    </div>

                                    <div className="mt-5 text-center">
                                        <p className="text-sm text-neutral-500 mb-3">
                                            Not a member yet?
                                        </p>
                                        <Button
                                            onClick={() => {
                                                // Store current URL for redirect after signup
                                                localStorage.setItem('redirectAfterLogin', window.location.pathname)
                                                window.location.href = '/signup'
                                            }}
                                            variant="outline"
                                            size="md"
                                            className="w-full"
                                        >
                                            Become a Quiet Believer
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                // Forgot Password Form
                                <>
                                    <button
                                        onClick={() => {
                                            setStep('login')
                                            setError(null)
                                            setResetEmail('')
                                        }}
                                        className="absolute top-6 left-6 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                                        aria-label="Back to login"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    <div className="text-center mb-8 mt-4">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, type: 'spring' }}
                                            className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                                        >
                                            <Mail className="w-8 h-8 text-white" />
                                        </motion.div>
                                        <h2 className="text-3xl font-black text-neutral-900 mb-2">
                                            Reset Password
                                        </h2>
                                        <p className="text-neutral-600 text-sm">
                                            Enter your email and we'll send you a link to reset your password
                                        </p>
                                    </div>

                                    <form onSubmit={handleForgotPassword} className="space-y-6">
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            leftIcon={
                                                <Mail className="w-5 h-5" />
                                            }
                                        />

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3"
                                            >
                                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                                <p className="text-red-700 text-sm">{error}</p>
                                            </motion.div>
                                        )}

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            isLoading={isLoading}
                                        >
                                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                                        </Button>
                                    </form>

                                    <p className="mt-6 text-center text-sm text-neutral-600">
                                        Check your email for a password reset link. You can close this dialog.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
