import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { useAuth } from '@/hooks/useAuth'
import { toggleMenu } from '@store/slices/uiSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, ChevronDown, Mountain, Radio, Home, BookOpen, Heart, Info } from 'lucide-react'
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

    const isActive = (path: string) => {
        // Match detail pages for all sections
        if (path === '/journeys') {
            return location.pathname === path || location.pathname.startsWith('/journeys/')
        }
        if (path === '/homestays') {
            return location.pathname === path || location.pathname.startsWith('/homestays/') || location.pathname.startsWith('/properties/')
        }
        if (path === '/guides') {
            return location.pathname === path || location.pathname.startsWith('/guides/')
        }
        if (path === '/pulse') {
            return location.pathname === path || location.pathname.startsWith('/pulse/')
        }
        if (path === '/stay-and-give') {
            return location.pathname === path || location.pathname.startsWith('/stay-and-give/')
        }
        return location.pathname === path
    }

    const navLinks = [
        { path: '/journeys', label: 'Journeys', icon: Mountain },
        { path: '/pulse', label: 'Pulse', icon: Radio },
        { path: '/homestays', label: 'Stays', icon: Home },
        { path: '/guides', label: 'Guides', icon: BookOpen },
        { path: '/stay-and-give', label: 'Impact', icon: Heart },
        { path: '/about', label: 'About', icon: Info },
    ]

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md shadow-sm border-b transition-all duration-200" style={{ background: 'rgba(30,33,57,0.95)', borderColor: '#2d3548' }}>
            <nav className="container mx-auto px-6 sm:px-8 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 group shrink-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 shadow-sm" style={{ borderColor: '#5CE1E6' }}>
                        <img
                            src="/images/logo.jpg"
                            alt="QuietSummit Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-lg md:text-xl font-bold tracking-tight" style={{ color: 'white' }}>
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
                                    ? 'text-primary-300'
                                    : 'text-white hover:text-primary-300'
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
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg group-hover:bg-white/10 group-hover:border-[#5CE1E6]/30 transition-all duration-300 group-hover:scale-105"></div>
                                <div className="relative flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center ring-2 ring-white/20 shadow-lg transition-all duration-300 group-hover:ring-[#5CE1E6]/40 group-hover:scale-110 group-hover:rotate-6">
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
                                        className="absolute right-0 mt-4 w-72 bg-[#1e2139]/98 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-50"
                                    >
                                        <div className="p-3">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setShowUserDropdown(false)}
                                                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#5CE1E6]/0 via-[#5CE1E6]/10 to-[#5CE1E6]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#6B8E7F] to-[#5A7A6B] flex items-center justify-center shadow-lg group-hover:shadow-[#5CE1E6]/30 group-hover:bg-gradient-to-br group-hover:from-[#5CE1E6] group-hover:to-[#4A90E2] group-hover:scale-110 transition-all duration-300">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <p className="text-sm font-black text-white group-hover:text-[#5CE1E6] transition-colors">Dashboard</p>
                                                    <p className="text-xs text-gray-400 font-medium">Manage your account</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                            </Link>

                                            <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                            <button
                                                onClick={() => {
                                                    logout()
                                                    setShowUserDropdown(false)
                                                }}
                                                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5A5A] to-[#7A4848] flex items-center justify-center shadow-lg group-hover:shadow-red-500/40 group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-red-600 group-hover:scale-110 transition-all duration-300">
                                                    <LogOut className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 text-left relative">
                                                    <p className="text-sm font-black text-white group-hover:text-red-400 transition-colors">Logout</p>
                                                    <p className="text-xs text-gray-400 font-medium">Sign out of your account</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
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
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg group-hover:bg-white/10 group-hover:border-[#5CE1E6]/30 transition-all duration-300 group-hover:scale-105"></div>
                                <div className="relative flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center ring-2 ring-white/20 shadow-lg transition-all duration-300 group-hover:ring-[#5CE1E6]/40 group-hover:scale-110 group-hover:rotate-6">
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
                                        className="absolute right-0 mt-4 w-72 bg-[#1e2139]/98 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-50"
                                    >
                                        <div className="p-3">
                                            <button
                                                onClick={() => {
                                                    setShowLoginModal(true)
                                                    setShowUserDropdown(false)
                                                }}
                                                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#5CE1E6]/0 via-[#5CE1E6]/10 to-[#5CE1E6]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#6B8E7F] to-[#5A7A6B] flex items-center justify-center shadow-lg group-hover:shadow-[#5CE1E6]/30 group-hover:bg-gradient-to-br group-hover:from-[#5CE1E6] group-hover:to-[#4A90E2] group-hover:scale-110 transition-all duration-300">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 text-left relative">
                                                    <p className="text-sm font-black text-white group-hover:text-[#5CE1E6] transition-colors">Login</p>
                                                    <p className="text-xs text-gray-400 font-medium">Access your account</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                            </button>

                                            <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                            <Link
                                                to="/signup"
                                                onClick={() => setShowUserDropdown(false)}
                                                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#4A90E2]/0 via-[#4A90E2]/10 to-[#4A90E2]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                                                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#6B7A8E] to-[#5A6A7E] flex items-center justify-center shadow-lg group-hover:shadow-[#4A90E2]/30 group-hover:bg-gradient-to-br group-hover:from-[#4A90E2] group-hover:to-[#5CE1E6] group-hover:scale-110 transition-all duration-300">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <p className="text-sm font-black text-white group-hover:text-[#4A90E2] transition-colors">Become a Member</p>
                                                    <p className="text-xs text-gray-400 font-medium">Join QuietSummit today</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
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
                    className={`lg:hidden p-2 transition-colors ${isMenuOpen ? 'opacity-0 pointer-events-none' : ''}`}
                    style={{ color: 'white' }}
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
                                className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 lg:hidden overflow-y-auto"
                                style={{
                                    background: 'rgba(10,12,20,0.96)',
                                    backdropFilter: 'blur(40px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                                    borderRight: '1px solid rgba(255,255,255,0.08)'
                                }}
                            >
                                {/* Menu Header */}
                                <div className="p-5 border-b flex items-center justify-between relative" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    <Link to="/" className="flex items-center space-x-3 relative" onClick={() => dispatch(toggleMenu())}>
                                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/15 shadow-lg shadow-black/30">
                                            <img
                                                src="/images/logo.jpg"
                                                alt="QuietSummit Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-lg font-black text-white tracking-tight">QuietSummit</span>
                                    </Link>
                                    <button
                                        onClick={() => dispatch(toggleMenu())}
                                        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                {/* Menu Items */}
                                <ul className="px-5 py-6 space-y-1">
                                    {navLinks.map((link, index) => {
                                        const Icon = link.icon
                                        return (
                                            <motion.li
                                                key={link.path}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Link
                                                    to={link.path}
                                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all ${isActive(link.path)
                                                        ? 'text-white'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                    style={isActive(link.path) ? { background: 'rgba(7,213,232,0.15)', color: '#07d5e8' } : {}}
                                                    onClick={() => dispatch(toggleMenu())}
                                                >
                                                    <Icon className="w-5 h-5" strokeWidth={2} />
                                                    <span>{link.label}</span>
                                                </Link>
                                            </motion.li>
                                        )
                                    })}
                                </ul>

                                {/* Menu Footer Actions */}
                                <div className="px-5 pb-6 space-y-3 border-t pt-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    {isAuthenticated ? (
                                        <>
                                            <Link to="/dashboard" onClick={() => dispatch(toggleMenu())}>
                                                <button className="w-full px-5 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 relative overflow-hidden group transition-all mb-4 shadow-[0_16px_40px_rgba(0,0,0,0.32)] hover:opacity-90" style={{ background: 'linear-gradient(180deg, #6a5ff0 0%, #524ae8 50%, #4842d8 100%)', color: 'white' }}>
                                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></span>
                                                    <User className="w-4 h-4 relative z-10" />
                                                    <span className="relative z-10 font-black">Dashboard</span>
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout()
                                                    dispatch(toggleMenu())
                                                }}
                                                className="w-full px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border shadow-[0_10px_26px_rgba(0,0,0,0.28)] hover:opacity-90"
                                                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)', borderColor: 'rgba(239,68,68,0.6)', color: '#ff6b6b' }}
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
                                                className="w-full px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all border shadow-[0_12px_30px_rgba(0,0,0,0.22)] hover:opacity-90"
                                                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)', borderColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                                            >
                                                Login
                                            </button>
                                            <Link to="/signup" onClick={() => dispatch(toggleMenu())}>
                                                <button className="w-full px-5 py-3 rounded-2xl text-sm font-semibold shadow-[0_16px_40px_rgba(0,0,0,0.32)] relative overflow-hidden group transition-all" style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}>
                                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></span>
                                                    <span className="relative z-10 font-black">Become a Member</span>
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
