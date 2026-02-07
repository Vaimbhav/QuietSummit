import { motion } from 'framer-motion'
import SignUpForm from '@components/forms/SignUpForm'
import Card from '@components/common/Card'

export default function SignUp() {
    return (
        <div className="min-h-screen" style={{ background: '#0a0e27' }}>
            {/* Hero Section */}
            <section className="relative text-white py-12 md:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)' }}>
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(255,255,255,0.15)' }}></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse animate-delay-1000" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto px-4 text-center relative z-10"
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 drop-shadow-2xl tracking-tight" style={{ color: '#0a0e27' }}>Become a Quiet Believer</h1>
                    <p className="text-base md:text-xl opacity-95 max-w-2xl mx-auto font-light" style={{ color: '#0a0e27' }}>
                        Join our community and be the first to know about new journeys, special offers, and travel inspiration.
                    </p>
                </motion.div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Sign Up Form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-xl" style={{ background: '#1e2139', borderTop: '4px solid #5CE1E6' }}>
                            <div className="text-center mb-8">
                                <div className="inline-block px-6 py-2 rounded-full mb-3" style={{ background: 'rgba(92,225,230,0.1)', border: '1px solid rgba(92,225,230,0.3)' }}>
                                    <span className="text-sm font-semibold" style={{ color: '#5CE1E6' }}>JOIN THE COMMUNITY</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'white', letterSpacing: '-0.02em' }}>Create Your Account</h2>
                                <p className="text-sm" style={{ color: '#B0B7C3' }}>Start your journey with QuietSummit today</p>
                            </div>
                            <SignUpForm />
                        </Card>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-6">
                        <Card style={{ background: 'linear-gradient(135deg, rgba(92,225,230,0.15) 0%, rgba(74,144,226,0.15) 100%)', border: '1px solid rgba(92,225,230,0.3)' }}>
                            <h3 className="text-xl font-bold mb-4" style={{ color: 'white' }}>Why Join Us?</h3>
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
                                        <span className="pt-1" style={{ color: '#B0B7C3' }}>{benefit.text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </Card>

                        <Card style={{ background: '#1e2139', border: '1px solid rgba(92,225,230,0.3)' }}>
                            <div className="text-center">
                                <div className="text-5xl mb-3">✨</div>
                                <h3 className="font-bold mb-2" style={{ color: 'white' }}>500+ Members</h3>
                                <p className="text-sm" style={{ color: '#B0B7C3' }}>
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
