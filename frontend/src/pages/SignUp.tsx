import { motion } from 'framer-motion'
import SignUpForm from '@components/forms/SignUpForm'
import Card from '@components/common/Card'

export default function SignUp() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 text-white py-24 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto px-4 text-center relative z-10"
                >
                    <h1 className="text-6xl font-black mb-6 drop-shadow-2xl tracking-tight">Become a Quiet Believer</h1>
                    <p className="text-xl opacity-95 max-w-2xl mx-auto font-light">
                        Join our community and be the first to know about new journeys, special offers, and travel inspiration.
                    </p>
                </motion.div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Sign Up Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Join our community</h2>
                            <SignUpForm />
                        </Card>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100">
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">Why Join Us?</h3>
                            <ul className="space-y-3">
                                {[
                                    { icon: '🎁', text: 'Exclusive early access to new journeys' },
                                    { icon: '💎', text: 'Special discounts for members' },
                                    { icon: '📧', text: 'Monthly travel inspiration newsletter' },
                                    { icon: '🌟', text: 'Invitations to member-only events' },
                                    { icon: '🤝', text: 'Connect with like-minded travelers' }
                                ].map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start space-x-3"
                                    >
                                        <span className="text-2xl">{benefit.icon}</span>
                                        <span className="text-neutral-700 pt-1">{benefit.text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </Card>

                        <Card>
                            <div className="text-center">
                                <div className="text-5xl mb-3">✨</div>
                                <h3 className="font-bold text-neutral-900 mb-2">500+ Members</h3>
                                <p className="text-sm text-neutral-600">
                                    Join a growing community of intentional travelers from around the world.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
