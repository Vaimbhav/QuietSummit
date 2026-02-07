import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Instagram, ArrowRight, Sparkles, MessageCircle } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#0f1433] to-[#0a0e27] text-[#B0B7C3] border-t border-[#5CE1E6]/20">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl bg-[#5CE1E6]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl bg-[#4A90E2]"></div>
            </div>
            <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
                    {/* Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-[0_4px_20px_rgba(92,225,230,0.3)] border-[#5CE1E6]">
                                <img
                                    src="/images/logo.jpg"
                                    alt="QuietSummit Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-white">QuietSummit</h3>
                        </div>
                        <p className="text-sm leading-relaxed mb-6 text-[#B0B7C3]">
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
                                    className="p-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md bg-[#1e2139] text-[#B0B7C3] hover:bg-[#5CE1E6] hover:text-[#0a0e27]"
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
                        <h4 className="font-bold mb-5 text-base text-white">Explore</h4>
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
                                        className="transition-colors flex items-center group text-[#B0B7C3] hover:text-white"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#5CE1E6]" />
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
                        <h4 className="font-bold mb-5 text-base text-white">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { path: '/faqs', label: 'FAQs' },
                                { path: '/terms', label: 'Terms & Conditions' },
                                { path: '/privacy', label: 'Privacy Policy' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link to={item.path} className="transition-colors flex items-center group text-[#B0B7C3] hover:text-white">
                                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#5CE1E6]" />
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
                        <h4 className="font-bold mb-5 text-base text-white">Stay Connected</h4>
                        <p className="text-sm mb-4 leading-relaxed text-[#B0B7C3]">
                            Join our community of quiet believers and receive exclusive travel inspiration.
                        </p>
                        <a href="https://chat.whatsapp.com/J0pKreKmOez2qAlzBnJ7hA" target="_blank" rel="noopener noreferrer">
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full px-6 py-4 rounded-xl transition-all font-bold text-sm shadow-lg hover:shadow-xl bg-linear-to-br from-[#5CE1E6] to-[#4A90E2] text-[#0a0e27]"
                            >
                                Join Community
                            </motion.button>
                        </a>
                        <div className="mt-8 p-5 backdrop-blur-sm rounded-2xl border transition-all duration-300 bg-[#1e2139]/80 border-[#2d3548] hover:border-[#5CE1E6]">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-xl shadow-lg shrink-0 bg-linear-to-br from-[#5CE1E6] to-[#4A90E2]">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="font-bold block text-base text-white">500+ Members</span>
                                    <span className="text-xs text-[#B0B7C3]">Travelers from around the world</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-[#2d3548]">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-[#6B7280]">
                            &copy; {currentYear} QuietSummit. All rights reserved.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <Link to="/privacy" className="transition-colors text-[#6B7280] hover:text-white">
                                Privacy
                            </Link>
                            <Link to="/terms" className="transition-colors text-[#6B7280] hover:text-white">
                                Terms
                            </Link>
                            <a href="#" className="transition-colors text-[#6B7280] hover:text-white">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
