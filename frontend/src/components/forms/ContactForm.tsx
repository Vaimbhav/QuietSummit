import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '@components/common/Input'
import TextArea from '@components/common/TextArea'
import Button from '@components/common/Button'
import { motion } from 'framer-motion'
import { submitContactForm, ContactFormData } from '../../services/api'

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>()

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true)
        setErrorMessage(null)
        try {
            await submitContactForm(data)
            setIsSuccess(true)
            reset()
            setTimeout(() => setIsSuccess(false), 5000)
        } catch (error: any) {
            console.error('Error submitting contact form:', error)
            setErrorMessage(error.response?.data?.error || 'Failed to send message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
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
                    label="Your Name"
                    placeholder="John Doe"
                    {...register('name', { required: 'Name is required' })}
                    error={errors.name?.message}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                />

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
                    error={errors.email?.message}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                />
            </div>

            <Input
                label="Subject"
                placeholder="How can we help you?"
                {...register('subject', { required: 'Subject is required' })}
                error={errors.subject?.message}
            />

            <TextArea
                label="Message"
                placeholder="Tell us more about your inquiry..."
                rows={6}
                {...register('message', {
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Message must be at least 10 characters' }
                })}
                error={errors.message?.message}
            />

            {isSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
                >
                    ✅ Thank you! Your message has been sent successfully. We'll get back to you soon.
                </motion.div>
            )}

            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                    ❌ {errorMessage}
                </motion.div>
            )}

            <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
            >
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
        </motion.form>
    )
}
