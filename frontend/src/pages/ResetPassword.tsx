import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import Button from '@components/common/Button'
import Input from '@components/common/Input'
import api from '@/services/api'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [validating, setValidating] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)

    useEffect(() => {
        validateToken()
    }, [token])

    const validateToken = async () => {
        if (!token) {
            setError('Invalid or missing reset token')
            setValidating(false)
            return
        }

        try {
            const response = await api.post('/auth/validate-reset-token', { token })
            if (response.data.success) {
                setTokenValid(true)
            } else {
                setError('Invalid or expired reset link')
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid or expired reset link')
        } finally {
            setValidating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Validation
            if (!password.trim() || !confirmPassword.trim()) {
                setError('Please fill in all fields')
                setIsLoading(false)
                return
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters long')
                setIsLoading(false)
                return
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match')
                setIsLoading(false)
                return
            }

            const response = await api.post('/auth/reset-password', {
                token,
                password
            })

            if (response.data.success) {
                setSuccess(true)
                setTimeout(() => {
                    navigate('/signup')
                }, 3000)
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to reset password. Please try again.'
            setError(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100">
                <Loader2 className="w-8 h-8 animate-spin text-stone-600" />
            </div>
        )
    }

    if (!tokenValid && !success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900 mb-2">
                        Invalid Reset Link
                    </h1>
                    <p className="text-stone-600 mb-6">
                        {error || 'This password reset link is invalid or has expired.'}
                    </p>
                    <Link to="/forgot-password">
                        <Button className="w-full">
                            Request New Link
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-stone-900 mb-2">
                            Password Reset Successfully
                        </h1>
                        <p className="text-stone-600 mb-6">
                            Your password has been reset. You can now log in with your new password.
                        </p>
                        <p className="text-sm text-stone-500">
                            Redirecting to login page...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-stone-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900 mb-2">
                        Set New Password
                    </h1>
                    <p className="text-stone-600">
                        Enter your new password below
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            label="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Password Requirements */}
                    <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">Password must:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Be at least 8 characters long</li>
                            <li>Contain letters and numbers</li>
                            <li>Match in both fields</li>
                        </ul>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
