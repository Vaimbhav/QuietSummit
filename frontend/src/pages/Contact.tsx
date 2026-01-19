import { motion } from 'framer-motion'
import ContactForm from '@components/forms/ContactForm'
import Card from '@components/common/Card'
import AIAssistant from '@components/common/AIAssistant'

export default function Contact() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-primary-600 text-white py-20 sm:py-24 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="container mx-auto px-6 sm:px-8 text-center relative z-10"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">Get in Touch</h1>
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
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
                                    <a href="mailto:Nagendrarajput9753@gmail.com" className="text-neutral-600 hover:text-primary-600 transition-colors">
                                        Nagendrarajput9753@gmail.com
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
                                        href="https://wa.me/919968086660"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-600 hover:text-primary-600 transition-colors"
                                    >
                                        +91 99680 86660
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
            <AIAssistant />
        </div>
    )
}
