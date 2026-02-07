import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@store/hooks'
import { setUser } from '@store/slices/userSlice'
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
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isExistingMember, setIsExistingMember] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [phoneCountry, setPhoneCountry] = useState('IN')
    const [isHostMode, setIsHostMode] = useState(false)
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
                subscribeToNewsletter: data.subscribeToNewsletter,
                isHost: isHostMode
            }
            const response = await submitSignUp(submitData)

            // Store user in localStorage AND Redux with token
            const userData = {
                email: response.data.email,
                name: response.data.name,
                token: response.data.token,
                id: response.data.id,
                phone: response.data.phone,
                interests: response.data.interests,
                subscribeToNewsletter: response.data.subscribeToNewsletter,
                memberSince: response.data.memberSince,
                role: response.data.role,
                isHost: response.data.isHost || isHostMode,
                isAuthenticated: true
            }
            localStorage.setItem('quietsummit_user', JSON.stringify(userData))

            // Immediately update Redux store
            dispatch(setUser({
                email: response.data.email,
                name: response.data.name,
                token: response.data.token,
                role: response.data.role,
                isHost: response.data.isHost || isHostMode,
                isAuthenticated: true
            }))

            // Check if there's a redirect URL
            const redirectUrl = localStorage.getItem('redirectAfterLogin')

            setIsSuccess(true)

            setTimeout(() => {
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin')
                    // Navigate back to the journey detail page
                    window.location.href = redirectUrl
                } else {
                    // If no redirect, go to dashboard
                    if (isHostMode || response.data.role === 'host') {
                        navigate('/host/dashboard')
                    } else {
                        navigate('/dashboard')
                    }
                }
            }, 1500)

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
                <h3 className="text-3xl font-bold mb-4" style={{ color: 'white' }}>
                    Welcome to the QuietSummit Community!
                </h3>
                <p className="text-lg mb-8" style={{ color: '#B0B7C3' }}>
                    Thank you for becoming a Quiet Believer. We'll keep you updated on our latest journeys and exclusive offers.
                </p>
                <Button onClick={() => setIsSuccess(false)} style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27', fontWeight: '600' }}>
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
            <div className="flex gap-4 mb-8 justify-center">
                <div
                    onClick={() => setIsHostMode(false)}
                    className="cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 w-40 aspect-square flex flex-col items-center justify-center"
                    style={!isHostMode ? {
                        borderColor: '#5CE1E6',
                        background: 'rgba(92,225,230,0.1)',
                        boxShadow: '0 0 20px rgba(92,225,230,0.2), 0 8px 16px rgba(0,0,0,0.3)'
                    } : {
                        borderColor: 'rgba(92,225,230,0.2)',
                        background: '#1e2139',
                        opacity: 0.7
                    }}
                    onMouseEnter={(e) => {
                        if (isHostMode) {
                            e.currentTarget.style.opacity = '1'
                            e.currentTarget.style.borderColor = 'rgba(92,225,230,0.4)'
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (isHostMode) {
                            e.currentTarget.style.opacity = '0.7'
                            e.currentTarget.style.borderColor = 'rgba(92,225,230,0.2)'
                        }
                    }}
                >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-3xl" style={{ background: !isHostMode ? 'rgba(92,225,230,0.2)' : 'rgba(255,255,255,0.05)' }}>
                        🌏
                    </div>
                    <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={!isHostMode ? { borderColor: '#5CE1E6', background: '#5CE1E6' } : { borderColor: 'rgba(176,183,195,0.3)' }}>
                            {(!isHostMode) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                    </div>
                    <h3 className="font-bold text-base mb-1 text-center" style={{ color: !isHostMode ? '#5CE1E6' : '#B0B7C3' }}>Member</h3>
                    <p className="text-xs leading-relaxed text-center" style={{ color: !isHostMode ? 'white' : '#B0B7C3' }}>
                        Discover & book journeys
                    </p>
                </div>

                <div
                    onClick={() => setIsHostMode(true)}
                    className="cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 w-40 aspect-square flex flex-col items-center justify-center"
                    style={isHostMode ? {
                        borderColor: '#5CE1E6',
                        background: 'rgba(92,225,230,0.1)',
                        boxShadow: '0 0 20px rgba(92,225,230,0.2), 0 8px 16px rgba(0,0,0,0.3)'
                    } : {
                        borderColor: 'rgba(92,225,230,0.2)',
                        background: '#1e2139',
                        opacity: 0.7
                    }}
                    onMouseEnter={(e) => {
                        if (!isHostMode) {
                            e.currentTarget.style.opacity = '1'
                            e.currentTarget.style.borderColor = 'rgba(92,225,230,0.4)'
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isHostMode) {
                            e.currentTarget.style.opacity = '0.7'
                            e.currentTarget.style.borderColor = 'rgba(92,225,230,0.2)'
                        }
                    }}
                >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-3xl" style={{ background: isHostMode ? 'rgba(92,225,230,0.2)' : 'rgba(255,255,255,0.05)' }}>
                        🏡
                    </div>
                    <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={isHostMode ? { borderColor: '#5CE1E6', background: '#5CE1E6' } : { borderColor: 'rgba(176,183,195,0.3)' }}>
                            {(isHostMode) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                    </div>
                    <h3 className="font-bold text-base mb-1 text-center" style={{ color: isHostMode ? '#5CE1E6' : '#B0B7C3' }}>Host</h3>
                    <p className="text-xs leading-relaxed text-center" style={{ color: isHostMode ? 'white' : '#B0B7C3' }}>
                        List & host travelers
                    </p>
                </div>
            </div>

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
                darkMode={true}
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
                <label className="block text-sm font-medium mb-3" style={{ color: 'white' }}>
                    What interests you? (Select all that apply)
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                    {interests.map((interest) => (
                        <label key={interest} className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                value={interest}
                                {...register('interests', { required: 'Please select at least one interest' })}
                                className="w-5 h-5 rounded border-[#5CE1E6]/30 bg-[#1e2139] text-[#5CE1E6] focus:ring-[#5CE1E6]/50"
                                style={{ accentColor: '#5CE1E6' }}
                            />
                            <span className="group-hover:text-[#5CE1E6] transition-colors" style={{ color: '#B0B7C3' }}>
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'white' }}>
                    How did you hear about us?
                </label>
                <select
                    {...register('howDidYouHear', { required: 'Please select an option' })}
                    className="w-full px-4 py-3 pr-12 rounded-lg border-2 focus:outline-none focus:ring-2 font-semibold appearance-none cursor-pointer shadow-sm hover:shadow-md transition-all bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_1rem] bg-no-repeat"
                    style={{ background: '#1e2139', borderColor: 'rgba(92,225,230,0.3)', color: 'white' }}
                >
                    <option value="" style={{ background: '#1e2139', color: 'white' }}>Select an option</option>
                    <option value="social-media" style={{ background: '#1e2139', color: 'white' }}>Social Media</option>
                    <option value="friend" style={{ background: '#1e2139', color: 'white' }}>Friend or Family</option>
                    <option value="search-engine" style={{ background: '#1e2139', color: 'white' }}>Search Engine</option>
                    <option value="blog" style={{ background: '#1e2139', color: 'white' }}>Travel Blog</option>
                    <option value="other" style={{ background: '#1e2139', color: 'white' }}>Other</option>
                </select>
                {errors.howDidYouHear && (
                    <p className="mt-1 text-sm text-red-600">{errors.howDidYouHear.message}</p>
                )}
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(92,225,230,0.05)', border: '1px solid rgba(92,225,230,0.2)' }}>
                <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register('subscribeToNewsletter')}
                        defaultChecked={true}
                        className="mt-1 w-5 h-5 rounded focus:ring-[#5CE1E6]/50"
                        style={{ accentColor: '#5CE1E6', borderColor: 'rgba(92,225,230,0.3)', background: '#1e2139' }}
                    />
                    <span className="text-sm" style={{ color: '#B0B7C3' }}>
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
                style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27', fontWeight: '700', boxShadow: '0 10px 24px rgba(92,225,230,0.3)' }}
            >
                {isSubmitting ? 'Creating Your Account...' : (isHostMode ? 'Start Hosting' : 'Start Your Journey')}
            </Button>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" style={{ borderColor: 'rgba(92,225,230,0.2)' }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4" style={{ background: '#0a0e27', color: '#B0B7C3' }}>Or sign up with</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        const googleAuthUrl = getGoogleAuthUrl()
                        window.location.href = googleAuthUrl
                    }}
                    type="button"
                    className="mt-6 w-full flex items-center justify-center gap-3 px-6 py-3 border rounded-xl transition-all font-semibold"
                    style={{ background: '#1e2139', borderColor: 'rgba(92,225,230,0.3)', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(92,225,230,0.1)'
                        e.currentTarget.style.borderColor = '#5CE1E6'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1e2139'
                        e.currentTarget.style.borderColor = 'rgba(92,225,230,0.3)'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
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
