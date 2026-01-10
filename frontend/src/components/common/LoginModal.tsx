import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, CheckCircle } from 'lucide-react'
import Input from './Input'
import Button from './Button'
import { loginMember, getGoogleAuthUrl } from '../../services/api'
import { useAppDispatch } from '@store/hooks'
import { setUser } from '@store/slices/userSlice'

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const dispatch = useAppDispatch()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const response = await loginMember(email, password)

            // Store user in Redux
            dispatch(setUser({
                email: response.data.email,
                name: response.data.name,
                isAuthenticated: true,
            }))

            // Store in localStorage
            localStorage.setItem('quietsummit_user', JSON.stringify(response.data))

            setSuccess(true)
            setTimeout(() => {
                onClose()
                window.location.href = '/dashboard'
            }, 1500)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setEmail('')
        setPassword('')
        setError(null)
        setSuccess(false)
        onClose()
    }

    const handleGoogleLogin = () => {
        const googleAuthUrl = getGoogleAuthUrl()
        window.location.href = googleAuthUrl
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
                        >
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                                        Welcome Back! 🎉
                                    </h3>
                                    <p className="text-neutral-600">
                                        Redirecting to your dashboard...
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <Mail className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-black text-neutral-900 mb-2">
                                            Welcome Back
                                        </h2>
                                        <p className="text-neutral-600">
                                            Enter your credentials to access your account
                                        </p>
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-6">
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

                                        <Input
                                            label="Password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                        />

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                                            >
                                                {error}
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

                                    <div className="mt-6">
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
                                            className="mt-6 w-full flex items-center justify-center gap-3 px-6 py-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors font-semibold text-neutral-700"
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

                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-neutral-600">
                                            Not a member yet?{' '}
                                            <a href="/signup" className="text-primary-600 font-bold hover:text-primary-700">
                                                Sign up here
                                            </a>
                                        </p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
