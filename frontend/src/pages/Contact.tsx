import { motion } from 'framer-motion'
import ContactForm from '@components/forms/ContactForm'
import Card from '@components/common/Card'

export default function Contact() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 text-white py-12 sm:py-16 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl animate-pulse animate-delay-1000"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto px-4 text-center relative z-10"
                >
                    <h1 className="text-6xl font-black mb-6 drop-shadow-2xl tracking-tight">Get in Touch</h1>
                    <p className="text-xl opacity-95 max-w-2xl mx-auto font-light">
                        Have questions about our journeys? We'd love to hear from you.
                    </p>
                </motion.div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send us a message</h2>
                            <ContactForm />
                        </Card>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <Card>
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-primary-100 rounded-lg">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 mb-1">Email Us</h3>
                                    <a href="mailto:quietsummit07@gmail.com" className="text-neutral-600 hover:text-primary-600 transition-colors">
                                        quietsummit07@gmail.com
                                    </a>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-primary-100 rounded-lg">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 mb-1">WhatsApp Us</h3>
                                    <a
                                        href="https://wa.me/918505097594"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-600 hover:text-primary-600 transition-colors"
                                    >
                                        +91 85050 97594
                                    </a>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-primary-100 rounded-lg">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 mb-1">Office Hours</h3>
                                    <p className="text-neutral-600">Everyday: 9am - 9pm IST</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-primary-50">
                            <h3 className="font-bold text-neutral-900 mb-2">Response Time</h3>
                            <p className="text-sm text-neutral-600">
                                We typically respond within a few hours. For urgent inquiries, please WhatsApp us directly.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
