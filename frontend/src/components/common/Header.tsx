import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { useAuth } from '@/hooks/useAuth'
import { toggleMenu } from '@store/slices/uiSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import LoginModal from './LoginModal'


export default function Header() {
    const dispatch = useAppDispatch()
    const isMenuOpen = useAppSelector((state) => state.ui.isMenuOpen)
    const { isAuthenticated, logout } = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [userDropdownClickedOpen, setUserDropdownClickedOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false)
                setUserDropdownClickedOpen(false)
            }
        }

        if (showUserDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showUserDropdown])

    // Prevent body scroll when dropdown is open
    useEffect(() => {
        if (showUserDropdown) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [showUserDropdown])

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
        { path: '/homestays', label: 'Homestays' },
        { path: '/about', label: 'About' },
        { path: '/future-offerings', label: 'Future Offerings' },
        { path: '/contact', label: 'Contact' }
    ]

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100 transition-all duration-200">
            <nav className="container mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 group shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 shadow-sm">
                        <img
                            src="/images/logo.jpg"
                            alt="QuietSummit Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
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
                    <div className="hidden lg:flex items-center gap-4">


                        {/* User Dropdown */}
                        <div
                            className="relative"
                            ref={dropdownRef}
                            onMouseEnter={() => {
                                if (!userDropdownClickedOpen) {
                                    setShowUserDropdown(true)
                                }
                            }}
                            onMouseLeave={() => {
                                if (!userDropdownClickedOpen) {
                                    setShowUserDropdown(false)
                                }
                            }}
                        >
                            <button
                                onClick={() => {
                                    if (showUserDropdown && userDropdownClickedOpen) {
                                        // Was clicked open, now closing
                                        setUserDropdownClickedOpen(false)
                                    } else if (showUserDropdown && !userDropdownClickedOpen) {
                                        // Was hover opened, now lock it open
                                        setUserDropdownClickedOpen(true)
                                    } else {
                                        // Was closed, now opening by click
                                        setShowUserDropdown(true)
                                        setUserDropdownClickedOpen(true)
                                    }
                                }}
                                className="group relative px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-2xl shadow-luxury-lg group-hover:shadow-luxury-xl transition-all duration-300 group-hover:scale-105"></div>
                                <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                                <div className="relative flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center ring-2 ring-white/40 shadow-lg transition-all duration-300 group-hover:ring-white/60 group-hover:scale-110 group-hover:rotate-6">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-white transition-all duration-300 ${showUserDropdown ? 'rotate-180' : ''} group-hover:translate-y-0.5`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {showUserDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/60 overflow-hidden z-50"
                                    >
                                        <div className="p-3">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setShowUserDropdown(false)}
                                                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100/50 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40 group-hover:scale-110 transition-all duration-300">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <p className="text-sm font-black text-neutral-900 group-hover:text-primary-700 transition-colors">Dashboard</p>
                                                    <p className="text-xs text-neutral-500 font-medium">Manage your account</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-neutral-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                            </Link>

                                            <div className="my-3 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>

                                            <button
                                                onClick={() => {
                                                    logout()
                                                    setShowUserDropdown(false)
                                                }}
                                                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:shadow-xl group-hover:shadow-red-500/40 group-hover:scale-110 transition-all duration-300">
                                                    <LogOut className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 text-left relative">
                                                    <p className="text-sm font-black text-red-600 group-hover:text-red-700 transition-colors">Logout</p>
                                                    <p className="text-xs text-neutral-500 font-medium">Sign out of your account</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-neutral-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                        {/* Guest User Dropdown */}
                        <div
                            className="relative"
                            ref={dropdownRef}
                            onMouseEnter={() => {
                                if (!userDropdownClickedOpen) {
                                    setShowUserDropdown(true)
                                }
                            }}
                            onMouseLeave={() => {
                                if (!userDropdownClickedOpen) {
                                    setShowUserDropdown(false)
                                }
                            }}
                        >
                            <button
                                onClick={() => {
                                    if (showUserDropdown && userDropdownClickedOpen) {
                                        // Was clicked open, now closing
                                        setShowUserDropdown(false)
                                        setUserDropdownClickedOpen(false)
                                    } else if (showUserDropdown && !userDropdownClickedOpen) {
                                        // Was hover opened, now lock it open
                                        setUserDropdownClickedOpen(true)
                                    } else {
                                        // Was closed, now opening by click
                                        setShowUserDropdown(true)
                                        setUserDropdownClickedOpen(true)
                                    }
                                }}
                                className="group relative px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-2xl shadow-luxury-lg group-hover:shadow-luxury-xl transition-all duration-300 group-hover:scale-105"></div>
                                <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                                <div className="relative flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center ring-2 ring-white/40 shadow-lg transition-all duration-300 group-hover:ring-white/60 group-hover:scale-110 group-hover:rotate-6">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-white transition-all duration-300 ${showUserDropdown ? 'rotate-180' : ''} group-hover:translate-y-0.5`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {showUserDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/60 overflow-hidden z-50"
                                    >
                                        <div className="p-3">
                                            <button
                                                onClick={() => {
                                                    setShowLoginModal(true)
                                                    setShowUserDropdown(false)
                                                }}
                                                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100/50 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40 group-hover:scale-110 transition-all duration-300">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 text-left relative">
                                                    <p className="text-sm font-black text-neutral-900 group-hover:text-primary-700 transition-colors">Login</p>
                                                    <p className="text-xs text-neutral-500 font-medium">Access your account</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-neutral-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                            </button>

                                            <div className="my-3 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>

                                            <Link
                                                to="/signup"
                                                onClick={() => setShowUserDropdown(false)}
                                                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100/50 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-accent-500/0 via-accent-500/5 to-accent-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:shadow-xl group-hover:shadow-accent-500/40 group-hover:scale-110 transition-all duration-300">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <p className="text-sm font-black text-neutral-900 group-hover:text-accent-700 transition-colors">Become a Member</p>
                                                    <p className="text-xs text-neutral-500 font-medium">Join QuietSummit today</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-neutral-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
                                <div className="px-5 pb-6 space-y-3 border-t border-neutral-100 pt-5">
                                    {isAuthenticated ? (
                                        <>

                                            <Link to="/dashboard" onClick={() => dispatch(toggleMenu())}>
                                                <button className="w-full px-5 py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold shadow-[0_4px_14px_0_rgba(74,139,112,0.39)] hover:shadow-[0_6px_20px_rgba(74,139,112,0.45)] flex items-center justify-center gap-2 relative overflow-hidden group transition-all mb-4">
                                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></span>
                                                    <User className="w-4 h-4 relative z-10" />
                                                    <span className="relative z-10">Dashboard</span>
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout()
                                                    dispatch(toggleMenu())
                                                }}
                                                className="w-full px-5 py-2.5 bg-white border-2 border-red-500 text-red-600 rounded-xl text-sm font-semibold shadow-[0_2px_8px_rgba(239,68,68,0.08)] hover:bg-red-50 hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] flex items-center justify-center gap-2 transition-all"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </>
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
                                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></span>
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
