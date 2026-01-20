import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Instagram, ArrowRight, Sparkles, MessageCircle } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-linear-to-b from-neutral-900 to-black text-neutral-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
            </div>
            <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
                    {/* Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center space-x-3 mb-6 text-white">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-500 shadow-lg shadow-primary-500/30">
                                <img
                                    src="/images/logo.jpg"
                                    alt="QuietSummit Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight gradient-text">QuietSummit</h3>
                        </div>
                        <p className="text-sm leading-relaxed mb-6 text-neutral-400">
                            Slow travel. Deep connections. Intentional experiences in nature.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { icon: MessageCircle, href: 'https://wa.me/919968086660', label: 'WhatsApp' },
                                { icon: Instagram, href: 'https://instagram.com/quietsummit.in', label: 'Instagram' },
                                { icon: Mail, href: 'mailto:Nagendrarajput9753@gmail.com', label: 'Email' }
                            ].map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05 }}
                                    className="p-3 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <h4 className="font-bold text-white mb-6 text-lg">Explore</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { path: '/journeys', label: 'Our Journeys' },
                                { path: '/about', label: 'About Us' },
                                { path: '/future-offerings', label: 'Future Offerings' },
                                { path: '/contact', label: 'Contact Us' }
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="hover:text-white transition-colors flex items-center group"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 text-primary-500 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Resources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className="font-bold text-white mb-6 text-lg">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { path: '/faqs', label: 'FAQs' },
                                { path: '/terms', label: 'Terms & Conditions' },
                                { path: '/privacy', label: 'Privacy Policy' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link to={item.path} className="hover:text-white transition-colors flex items-center group">
                                        <ArrowRight className="w-4 h-4 mr-2 text-primary-500 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Newsletter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 className="font-bold text-white mb-6 text-lg">Stay Connected</h4>
                        <p className="text-sm mb-4 leading-relaxed text-neutral-400">
                            Join our community of quiet believers and receive exclusive travel inspiration.
                        </p>
                        <a href="https://chat.whatsapp.com/J0pKreKmOez2qAlzBnJ7hA" target="_blank" rel="noopener noreferrer">
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full px-6 py-4 bg-linear-to-r from-primary-600 via-primary-500 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:via-primary-600 hover:to-accent-700 transition-all font-bold text-sm shadow-lg hover:shadow-xl hover:shadow-primary-500/30"
                            >
                                Join Community
                            </motion.button>
                        </a>
                        <div className="mt-8 p-5 bg-linear-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-700/50 hover:border-primary-500/30 transition-all duration-300">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-linear-to-br from-primary-500 to-accent-600 rounded-xl shadow-lg shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-white block text-lg">500+ Members</span>
                                    <span className="text-xs text-neutral-400">Travelers from around the world</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-neutral-800 mt-16 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-neutral-500">
                            &copy; {currentYear} QuietSummit. All rights reserved. Made with 💚 for intentional travelers.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <Link to="/privacy" className="text-neutral-500 hover:text-white transition-colors">
                                Privacy
                            </Link>
                            <Link to="/terms" className="text-neutral-500 hover:text-white transition-colors">
                                Terms
                            </Link>
                            <a href="#" className="text-neutral-500 hover:text-white transition-colors">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
