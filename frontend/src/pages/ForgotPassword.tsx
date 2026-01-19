import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import Button from '@components/common/Button'
import Input from '@components/common/Input'
import api from '@/services/api'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (!email.trim()) {
                setError('Please enter your email address')
                setIsLoading(false)
                return
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address')
                setIsLoading(false)
                return
            }

            const response = await api.post('/auth/forgot-password', { email })

            if (response.data.success) {
                setSuccess(true)
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to send reset email. Please try again.'
            setError(errorMsg)
        } finally {
            setIsLoading(false)
        }
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
                            Check Your Email
                        </h1>
                        <p className="text-stone-600 mb-6">
                            We've sent password reset instructions to <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-stone-500 mb-8">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </p>
                        <Link to="/signup">
                            <Button variant="outline" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
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
                        <Mail className="w-8 h-8 text-stone-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900 mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-stone-600">
                        Enter your email and we'll send you a link to reset your password
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        type="email"
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>

                {/* Back Link */}
                <div className="mt-6 text-center">
                    <Link
                        to="/signup"
                        className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
