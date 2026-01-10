import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { toggleMenu } from '@store/slices/uiSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import LoginModal from './LoginModal'

export default function Header() {
    const dispatch = useAppDispatch()
    const isMenuOpen = useAppSelector((state) => state.ui.isMenuOpen)
    const user = useAppSelector((state) => state.user)
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
        <header className="sticky top-0 z-50 glass-effect shadow-lg border-b border-primary-100/50 transition-all duration-300">
            <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
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
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full"
                                    />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                {user.isAuthenticated ? (
                    <Link to="/dashboard" className="hidden lg:block">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 lg:px-6 xl:px-7 py-2.5 lg:py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white rounded-full hover:from-primary-700 hover:via-primary-600 hover:to-accent-700 transition-all shadow-lg hover:shadow-xl text-xs lg:text-sm font-bold flex items-center gap-2"
                        >
                            <User className="w-4 h-4" />
                            Dashboard
                        </motion.button>
                    </Link>
                ) : (
                    <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 text-primary-700 hover:text-primary-800 font-bold text-xs lg:text-sm"
                        >
                            Login
                        </button>
                        <Link to="/signup">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 lg:px-5 xl:px-7 py-2.5 lg:py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white rounded-full hover:from-primary-700 hover:via-primary-600 hover:to-accent-700 transition-all shadow-lg hover:shadow-xl text-xs lg:text-sm font-bold whitespace-nowrap"
                            >
                                Become a Member
                            </motion.button>
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => dispatch(toggleMenu())}
                    className="lg:hidden p-2 text-neutral-600 hover:text-primary-600 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
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
                                className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9998] lg:hidden"
                                onClick={() => dispatch(toggleMenu())}
                            />

                            {/* Side Menu */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-[9999] lg:hidden overflow-y-auto"
                            >
                                {/* Menu Header */}
                                <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white">
                                    <Link to="/" className="flex items-center space-x-2" onClick={() => dispatch(toggleMenu())}>
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 shadow-md">
                                            <img
                                                src="/images/logo.jpg"
                                                alt="QuietSummit Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-xl font-black gradient-text">QuietSummit</span>
                                    </Link>
                                    <button
                                        onClick={() => dispatch(toggleMenu())}
                                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X className="w-6 h-6 text-neutral-600" />
                                    </button>
                                </div>

                                {/* Menu Items */}
                                <ul className="px-6 py-8 space-y-2">
                                    {navLinks.map((link, index) => (
                                        <motion.li
                                            key={link.path}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link
                                                to={link.path}
                                                className={`block px-4 py-3 rounded-xl text-lg font-bold transition-all ${isActive(link.path)
                                                        ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700'
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
                                <div className="px-6 pb-8 space-y-3 border-t border-neutral-200 pt-6">
                                    {user.isAuthenticated ? (
                                        <Link to="/dashboard" onClick={() => dispatch(toggleMenu())}>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white rounded-full font-bold shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <User className="w-5 h-5" />
                                                Dashboard
                                            </motion.button>
                                        </Link>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setShowLoginModal(true)
                                                    dispatch(toggleMenu())
                                                }}
                                                className="w-full px-6 py-3 text-primary-700 hover:bg-primary-50 rounded-full font-bold transition-all"
                                            >
                                                Login
                                            </button>
                                            <Link to="/signup" onClick={() => dispatch(toggleMenu())}>
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white rounded-full font-bold shadow-lg"
                                                >
                                                    Become a Member
                                                </motion.button>
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
