import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '@components/common/Input'
import Button from '@components/common/Button'
import PhoneInput from '@components/common/PhoneInput'
import { motion } from 'framer-motion'
import { submitSignUp, checkMember, getGoogleAuthUrl } from '../../services/api'

interface SignUpFormData {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    phone?: string
    phoneCountry?: string
    interests: string[]
    howDidYouHear: string
    subscribeToNewsletter: boolean
}

export default function SignUpForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isExistingMember, setIsExistingMember] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [phoneCountry, setPhoneCountry] = useState('IN')
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<SignUpFormData>()

    const emailValue = watch('email')

    // Check if email is already a member
    const handleEmailBlur = async () => {
        if (emailValue && emailValue.includes('@')) {
            try {
                const response = await checkMember(emailValue)
                if (response.isMember) {
                    setIsExistingMember(true)
                    setErrorMessage('This email is already registered. Please login to access your account.')
                }
            } catch (error) {
                // Silently fail, user will get error on submit
            }
        }
    }

    const interests = [
        'Mountain Trekking',
        'Beach Retreats',
        'Cultural Immersion',
        'Wellness & Yoga',
        'Wildlife & Nature',
        'Adventure Sports'
    ]

    const onSubmit = async (data: SignUpFormData) => {
        setIsSubmitting(true)
        setErrorMessage(null)
        setIsExistingMember(false)

        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            setErrorMessage('Passwords do not match')
            setIsSubmitting(false)
            return
        }

        try {
            // Combine first and last name for backend
            const submitData = {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                password: data.password,
                phone: phoneNumber,
                phoneCountry: phoneCountry,
                interests: data.interests,
                subscribeToNewsletter: data.subscribeToNewsletter
            }
            await submitSignUp(submitData)
            setIsSuccess(true)
            reset()
            setPhoneNumber('')
        } catch (error: any) {
            console.error('Error submitting signup:', error)
            const errorMsg = error.response?.data?.error || 'Failed to sign up. Please try again.'
            setErrorMessage(errorMsg)

            // If email already registered, show member flag
            if (errorMsg.includes('already registered')) {
                setIsExistingMember(true)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
            >
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-4">
                    Welcome to the QuietSummit Community!
                </h3>
                <p className="text-lg text-neutral-600 mb-8">
                    Thank you for becoming a Quiet Believer. We'll keep you updated on our latest journeys and exclusive offers.
                </p>
                <Button onClick={() => setIsSuccess(false)}>
                    Sign Up Another Person
                </Button>
            </motion.div>
        )
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <div className="grid md:grid-cols-2 gap-6">
                <Input
                    label="First Name"
                    placeholder="John"
                    {...register('firstName', { required: 'First name is required' })}
                    error={errors.firstName?.message}
                />

                <Input
                    label="Last Name"
                    placeholder="Doe"
                    {...register('lastName', { required: 'Last name is required' })}
                    error={errors.lastName?.message}
                />
            </div>

            <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                {...register('email', {
                    required: 'Email is required',
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                    }
                })}
                onBlur={handleEmailBlur}
                error={errors.email?.message}
                leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                }
            />

            <PhoneInput
                label="Phone Number (Optional)"
                value={phoneNumber}
                onChange={(phone, countryCode) => {
                    setPhoneNumber(phone)
                    setPhoneCountry(countryCode)
                }}
                defaultCountry="IN"
            />

            <div className="grid md:grid-cols-2 gap-6">
                <Input
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                        }
                    })}
                    error={errors.password?.message}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    }
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter your password"
                    {...register('confirmPassword', {
                        required: 'Please confirm your password'
                    })}
                    error={errors.confirmPassword?.message}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                    What interests you? (Select all that apply)
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                    {interests.map((interest) => (
                        <label key={interest} className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                value={interest}
                                {...register('interests', { required: 'Please select at least one interest' })}
                                className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-neutral-700 group-hover:text-primary-600 transition-colors">
                                {interest}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.interests && (
                    <p className="mt-2 text-sm text-red-600">{errors.interests.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    How did you hear about us?
                </label>
                <select
                    {...register('howDidYouHear', { required: 'Please select an option' })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="">Select an option</option>
                    <option value="social-media">Social Media</option>
                    <option value="friend">Friend or Family</option>
                    <option value="search-engine">Search Engine</option>
                    <option value="blog">Travel Blog</option>
                    <option value="other">Other</option>
                </select>
                {errors.howDidYouHear && (
                    <p className="mt-1 text-sm text-red-600">{errors.howDidYouHear.message}</p>
                )}
            </div>

            <div className="bg-primary-50 p-4 rounded-lg">
                <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register('subscribeToNewsletter')}
                        defaultChecked={true}
                        className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">
                        I agree to receive updates, travel tips, and exclusive offers from QuietSummit. You can unsubscribe at any time.
                    </span>
                </label>
            </div>

            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                >
                    <p className="font-semibold mb-2">❌ {errorMessage}</p>
                    {isExistingMember && (
                        <a
                            href="/dashboard"
                            className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                        >
                            Login to Your Account →
                        </a>
                    )}
                </motion.div>
            )}

            <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
            >
                {isSubmitting ? 'Creating Your Account...' : 'Become a Quiet Believer'}
            </Button>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-neutral-500">Or sign up with</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        const googleAuthUrl = getGoogleAuthUrl()
                        window.location.href = googleAuthUrl
                    }}
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
        </motion.form>
    )
}
