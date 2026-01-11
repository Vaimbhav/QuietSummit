import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { useAuth } from '@/hooks/useAuth'
import { toggleMenu } from '@store/slices/uiSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import LoginModal from './LoginModal'

export default function Header() {
    const dispatch = useAppDispatch()
    const isMenuOpen = useAppSelector((state) => state.ui.isMenuOpen)
    const { isAuthenticated } = useAuth()
    const location = useLocation()
    const [showLoginModal, setShowLoginModal] = useState(false)

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMenuOpen])

    const isActive = (path: string) => location.pathname === path

    const navLinks = [
        { path: '/journeys', label: 'Journeys' },
        { path: '/about', label: 'About' },
        { path: '/future-offerings', label: 'Future Offerings' },
        { path: '/contact', label: 'Contact' }
    ]

    return (
        <header className="sticky top-0 z-50 glass-luxury shadow-luxury-lg border-b border-luxury transition-all duration-300">
            <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
                    <motion.div
                        whileHover={{ scale: 1.08, rotate: 8 }}
                        whileTap={{ scale: 0.92 }}
                        className="text-primary-600"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-primary-200 shadow-md group-hover:shadow-lg transition-shadow">
                            <img
                                src="/images/logo.jpg"
                                alt="QuietSummit Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                    <span className="text-lg sm:text-xl md:text-2xl font-black gradient-text tracking-tight">
                        QuietSummit
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <ul className="hidden lg:flex items-center space-x-6 xl:space-x-10">
                    {navLinks.map((link) => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={`text-sm font-bold transition-all relative py-1 ${isActive(link.path)
                                    ? 'text-primary-700'
                                    : 'text-neutral-700 hover:text-primary-600'
                                    }`}
                            >
                                {link.label}
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary-600 to-accent-600 rounded-full"
                                    />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                {isAuthenticated ? (
                    <Link to="/dashboard" className="hidden lg:block">
                        <button className="px-6 lg:px-7 xl:px-8 py-3 lg:py-3.5 gradient-premium text-white rounded-3xl shadow-luxury-lg hover:shadow-luxury-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs lg:text-sm font-extrabold flex items-center gap-2 relative overflow-hidden group">
                            <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                            <User className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">Dashboard</span>
                        </button>
                    </Link>
                ) : (
                    <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="px-4 lg:px-5 xl:px-6 py-2.5 lg:py-3 text-primary-700 hover:text-primary-800 font-extrabold text-xs lg:text-sm hover:bg-primary-50 rounded-2xl transition-all"
                        >
                            Login
                        </button>
                        <Link to="/signup">
                            <button className="px-5 lg:px-6 xl:px-8 py-3 lg:py-3.5 gradient-premium text-white rounded-3xl shadow-luxury-lg hover:shadow-luxury-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs lg:text-sm font-extrabold whitespace-nowrap relative overflow-hidden group">
                                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                                <span className="relative z-10">Become a Member</span>
                            </button>
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => dispatch(toggleMenu())}
                    className={`lg:hidden p-2 text-neutral-600 hover:text-primary-600 transition-colors ${isMenuOpen ? 'opacity-0 pointer-events-none' : ''}`}
                    aria-label="Toggle menu"
                >
                    <Menu className="w-6 h-6" />
                </motion.button>
            </nav>

            {/* Mobile Menu */}
            {createPortal(
                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            {/* Backdrop with blur */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
                                onClick={() => dispatch(toggleMenu())}
                            />

                            {/* Side Menu */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
                            >
                                {/* Menu Header */}
                                <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-white">
                                    <Link to="/" className="flex items-center space-x-2" onClick={() => dispatch(toggleMenu())}>
                                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-200 shadow-sm">
                                            <img
                                                src="/images/logo.jpg"
                                                alt="QuietSummit Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-lg font-bold gradient-text">QuietSummit</span>
                                    </Link>
                                    <button
                                        onClick={() => dispatch(toggleMenu())}
                                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X className="w-5 h-5 text-neutral-500" />
                                    </button>
                                </div>

                                {/* Menu Items */}
                                <ul className="px-5 py-6 space-y-1">
                                    {navLinks.map((link, index) => (
                                        <motion.li
                                            key={link.path}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link
                                                to={link.path}
                                                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive(link.path)
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                                                    }`}
                                                onClick={() => dispatch(toggleMenu())}
                                            >
                                                {link.label}
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>

                                {/* Menu Footer Actions */}
                                <div className="px-5 pb-6 space-y-2.5 border-t border-neutral-100 pt-5">
                                    {isAuthenticated ? (
                                        <Link to="/dashboard" onClick={() => dispatch(toggleMenu())}>
                                            <button className="w-full px-5 py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold shadow-[0_4px_14px_0_rgba(74,139,112,0.39)] hover:shadow-[0_6px_20px_rgba(74,139,112,0.45)] flex items-center justify-center gap-2 relative overflow-hidden group transition-all">
                                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                                <User className="w-4 h-4 relative z-10" />
                                                <span className="relative z-10">Dashboard</span>
                                            </button>
                                        </Link>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setShowLoginModal(true)
                                                    dispatch(toggleMenu())
                                                }}
                                                className="w-full px-5 py-2.5 bg-white border-2 border-primary-500 text-primary-600 rounded-xl text-sm font-semibold shadow-[0_2px_8px_rgba(74,139,112,0.08)] hover:bg-primary-50 hover:shadow-[0_4px_12px_rgba(74,139,112,0.15)] transition-all"
                                            >
                                                Login
                                            </button>
                                            <Link to="/signup" onClick={() => dispatch(toggleMenu())}>
                                                <button className="w-full px-5 py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold shadow-[0_4px_14px_0_rgba(74,139,112,0.39)] hover:shadow-[0_6px_20px_rgba(74,139,112,0.45)] relative overflow-hidden group transition-all">
                                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                                    <span className="relative z-10">Become a Member</span>
                                                </button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            <AnimatePresence>
                {showLoginModal && (
                    <LoginModal
                        isOpen={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                    />
                )}
            </AnimatePresence>
        </header>
    )
}
