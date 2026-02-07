import { Link } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Mountain, Compass, Users, Leaf, Sparkles } from 'lucide-react'
import SEO from '@components/common/SEO'
import UnifiedSearchBar from '@components/common/UnifiedSearchBar'

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
}

export default function Home() {
    return (
        <>
            <SEO />
            <div className="font-sans" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)', color: 'white' }}>
                {/* Hero Section */}
                <section className="relative h-[calc(100vh-64px)] min-h-[500px] sm:min-h-[600px] flex items-center justify-center overflow-hidden">
                    {/* Video Background */}
                    <div className="absolute inset-0 z-0">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute w-full h-full object-cover"
                        >
                            <source src="/videos/hero.mp4" type="video/mp4" />
                        </video>
                        {/* Enhanced overlay gradient for readability */}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,14,39,0.6) 0%, rgba(10,14,39,0.4) 50%, rgba(10,14,39,0.6) 100%)' }} />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(92,225,230,0.2) 0%, rgba(74,144,226,0.2) 100%)' }} />
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="container mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10 py-6 sm:py-12 max-w-6xl"
                    >
                        <motion.div variants={itemVariants} className="mb-6 sm:mb-8 flex justify-center">
                            <span className="px-6 py-3 rounded-full backdrop-blur-md text-sm font-medium tracking-wide border" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                                ✨ Rediscover the Art of Slow Travel
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl leading-tight sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 tracking-tight px-4"
                            style={{ color: 'white' }}
                        >
                            Find Your{' '}
                            <span style={{ color: '#5CE1E6' }}>Quiet</span>
                            {' '}Place
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-base leading-relaxed sm:text-xl md:text-2xl mb-10 sm:mb-12 max-w-3xl mx-auto font-light drop-shadow-2xl px-4"
                            style={{ color: 'rgba(255,255,255,0.98)' }}
                        >
                            Curated journeys designed to help you disconnect from the noise and reconnect with nature, yourself, and meaningful connections.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 max-w-lg sm:max-w-none mx-auto"
                        >
                            <Link to="/journeys" className="w-full sm:w-auto">
                                <button
                                    className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}
                                >
                                    <span>Explore Journeys</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <Link to="/about" className="w-full sm:w-auto">
                                <button
                                    className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-semibold rounded-xl border-2 shadow-xl hover:shadow-2xl transition-all duration-200 inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                                    style={{ background: '#1e2139', borderColor: '#5CE1E6', color: 'white' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4DD4E1'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#5CE1E6'}
                                >
                                    <span>Our Philosophy</span>
                                </button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Enhanced scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
                        style={{ color: 'white' }}
                    >
                        <span className="text-xs uppercase tracking-widest font-semibold drop-shadow-lg">Scroll</span>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                        >
                            <div className="w-6 h-10 border-2 border-white rounded-full p-1 shadow-lg">
                                <motion.div
                                    animate={{ y: [0, 12, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-1.5 h-1.5 bg-white rounded-full mx-auto"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Unified Search Bar Section */}
                <section className="py-12 md:py-0 relative z-20 md:flex md:items-center md:min-h-[75vh]" style={{ background: '#1a1d2e' }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="container mx-auto px-6"
                    >
                        <motion.h2
                            variants={itemVariants}
                            className="text-2xl md:text-5xl lg:text-6xl font-serif font-bold text-center mb-4 md:mb-10"
                            style={{ color: 'white' }}
                        >
                            Find Your Reset
                        </motion.h2>
                        <motion.p
                            variants={itemVariants}
                            className="text-center text-sm md:text-xl md:tracking-wider md:font-light mb-8 md:mb-20 max-w-3xl mx-auto"
                            style={{ color: '#B0B7C3' }}
                        >
                            Search across Quiet Stays, Transformative Experiences, and Impact Programs
                        </motion.p>
                        <motion.div variants={itemVariants}>
                            <UnifiedSearchBar />
                        </motion.div>
                    </motion.div>
                </section>

                {/* Quick Stats Section */}
                <section
                    className="py-8 md:py-20 lg:py-24 relative z-20 overflow-hidden"
                    style={{ background: '#0a0e27' }}
                >
                    <div
                        className="absolute inset-0 opacity-60 pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(circle at 20% 20%, rgba(92,225,230,0.12), transparent 35%), radial-gradient(circle at 80% 30%, rgba(74,144,226,0.14), transparent 38%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.05), transparent 42%)'
                        }}
                    />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="container mx-auto px-6 sm:px-8 relative"
                    >
                        {/* Section Header */}
                        <motion.div variants={itemVariants} className="text-center mb-5 md:mb-12">
                            <h2
                                className="text-2xl sm:text-3xl md:text-5xl font-black mb-2 md:mb-4 tracking-tight"
                                style={{ color: 'white' }}
                            >
                                Our Impact
                            </h2>
                            <p
                                className="text-sm sm:text-base md:text-xl max-w-3xl mx-auto leading-relaxed"
                                style={{ color: '#B0B7C3' }}
                            >
                                Transforming lives through mindful travel experiences
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-3 gap-3 md:gap-6 lg:gap-8 mx-auto max-w-[420px] md:max-w-5xl">
                            {[
                                { value: '12+', label: 'Curated Journeys', icon: Mountain },
                                { value: '500+', label: 'Happy Travelers', icon: Users },
                                { value: '15+', label: 'Experiences', icon: Compass }
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="text-center rounded-2xl lg:rounded-3xl border transition-all duration-300 w-full flex flex-col items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(145deg, #1b1f36 0%, #16192b 100%)',
                                        borderColor: 'rgba(92,225,230,0.18)',
                                        boxShadow: '0 12px 28px rgba(0,0,0,0.38), 0 0 0 1px rgba(92,225,230,0.04)',
                                        aspectRatio: '1/1',
                                        minHeight: window.innerWidth >= 768 ? '160px' : 'auto',
                                        padding: window.innerWidth >= 768 ? '2rem 1.5rem' : '7%'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#5CE1E6';
                                        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(92,225,230,0.2)';
                                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(92,225,230,0.18)';
                                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.38), 0 0 0 1px rgba(92,225,230,0.04)';
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    }}
                                >
                                    <div
                                        className="mb-2 md:mb-4 inline-flex p-2 md:p-4 rounded-xl lg:rounded-2xl shadow-md"
                                        style={{
                                            color: '#5CE1E6',
                                            background: 'linear-gradient(135deg, rgba(92,225,230,0.2), rgba(74,144,226,0.18))',
                                            boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
                                            border: '1px solid rgba(92,225,230,0.18)'
                                        }}
                                    >
                                        <stat.icon className="w-4 h-4 md:w-8 md:h-8 lg:w-10 lg:h-10" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-base md:text-2xl lg:text-4xl font-black mb-1 md:mb-3" style={{ color: 'white' }}>
                                        {stat.value}
                                    </h3>
                                    <p
                                        className="text-[9px] md:text-sm lg:text-base font-semibold tracking-wide leading-tight"
                                        style={{ color: '#B0B7C3' }}
                                    >
                                        {stat.label}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Philosophy Section */}
                <section className="py-14 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden" style={{ background: '#1a1d2e', color: 'white' }}>
                    <div className="absolute top-0 right-0 w-1/2 h-full blur-3xl -translate-y-1/2 translate-x-1/4 rounded-full" style={{ background: 'rgba(92,225,230,0.1)' }} />
                    <div className="absolute bottom-0 left-0 w-1/3 h-full blur-3xl translate-y-1/2 -translate-x-1/4 rounded-full" style={{ background: 'rgba(74,144,226,0.1)' }} />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="container mx-auto px-5 sm:px-6 text-center max-w-4xl relative z-10"
                    >
                        <motion.div variants={itemVariants} className="mb-5 sm:mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border" style={{ color: '#5CE1E6', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-bold tracking-widest uppercase text-xs sm:text-sm">Our Philosophy</span>
                        </motion.div>

                        <motion.h2 variants={itemVariants} className="text-2xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-5 sm:mb-8 px-3" style={{ color: 'white' }}>
                            In a world that moves too fast, <br className="hidden sm:block" />
                            we create spaces for <span style={{ color: '#5CE1E6', fontStyle: 'italic' }}>slowness</span>.
                        </motion.h2>

                        <motion.p variants={itemVariants} className="text-sm leading-relaxed sm:text-lg md:text-xl mb-8 sm:mb-12 font-light max-w-2xl mx-auto px-3" style={{ color: '#B0B7C3' }}>
                            Our journeys are not about ticking boxes. They are about deep immersion,
                            meaningful conversations, and the transformative power of nature.
                        </motion.p>

                        <motion.div variants={itemVariants}>
                            <Link to="/about">
                                <button
                                    className="px-8 py-4 text-base font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                                    style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none"></span>
                                    <span className="relative z-10 font-extrabold">Read Our Manifesto</span>
                                </button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="py-12 sm:py-16 md:py-20" style={{ background: '#0a0e27' }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="container mx-auto px-5 sm:px-6"
                    >
                        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-10 px-3">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 tracking-tight" style={{ color: 'white' }}>The Quiet Difference</h2>
                            <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#B0B7C3' }}>
                                Experience travel that prioritizes depth over distance and quality over quantity.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                            {[
                                {
                                    icon: Leaf,
                                    number: '01',
                                    title: 'Sustainable by Design',
                                    description: 'We prioritize eco-friendly accommodations and support local economies, leaving a positive footprint wherever we go.'
                                },
                                {
                                    icon: Users,
                                    number: '02',
                                    title: 'Intimate Groups',
                                    description: 'Small group sizes (max 12) ensure personalized attention, flexibility, and the opportunity for genuine connection.'
                                },
                                {
                                    icon: Sparkles,
                                    number: '03',
                                    title: 'Mindful Experiences',
                                    description: 'We build in time for reflection, meditation, and simply "being" in the destination, rather than just "seeing" it.'
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ y: -3 }}
                                    className="relative"
                                >
                                    <div
                                        className="p-4 md:p-5 rounded-xl md:rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col items-center justify-center text-center"
                                        style={{ background: '#1e2139', borderColor: '#2d3548', minHeight: '220px' }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5CE1E6'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2d3548'}
                                    >
                                        {/* Number Badge */}
                                        <div
                                            className="absolute -top-2 -right-2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2"
                                            style={{ background: '#4A90E2', color: 'white', borderColor: '#5CE1E6' }}
                                        >
                                            {feature.number}
                                        </div>

                                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 md:mb-3 shadow-md group-hover:scale-110 transition-all duration-300" style={{ color: '#5CE1E6', background: 'rgba(92,225,230,0.1)' }}>
                                            <feature.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-sm md:text-base font-black mb-2 tracking-tight" style={{ color: 'white' }}>{feature.title}</h3>
                                        <p className="leading-relaxed text-[10px] md:text-[11px]" style={{ color: '#B0B7C3' }}>{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Our Philosophy Section (Repurposed Visuals) */}
                <section className="py-14 sm:py-16 md:py-20 overflow-hidden" style={{ background: '#1a1d2e', color: 'white' }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="container mx-auto px-5 sm:px-6"
                    >
                        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 px-3">
                            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-4 py-2 rounded-full backdrop-blur-sm border shadow-md" style={{ color: '#5CE1E6', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(92,225,230,0.3)' }}>
                                <Compass className="w-4 h-4" />
                                <span className="text-xs font-bold tracking-widest uppercase">Our Approach</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-3 sm:mb-4 leading-tight" style={{ color: 'white' }}>Why We Go to the Wild</h2>
                            <p className="max-w-2xl mx-auto font-light text-sm sm:text-base leading-relaxed" style={{ color: '#B0B7C3' }}>
                                We don't just organize treks. We curate experiences designed to reset your rhythm.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
                            {/* 1. Digital Detox */}
                            <motion.div variants={itemVariants} className="group flex flex-col">
                                <div className="relative aspect-[4/3] mb-5 sm:mb-6 overflow-hidden rounded-2xl shadow-xl">
                                    <img
                                        src="/images/insta-1.jpg"
                                        alt="Digital Detox"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 transition-all duration-500" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                                </div>
                                <h3
                                    className="text-lg sm:text-xl font-serif mb-2 sm:mb-2.5 group-hover:transition-colors tracking-tight"
                                    style={{ color: 'white' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                                >The Art of Disconnecting</h3>
                                <p className="font-light leading-relaxed text-xs sm:text-sm" style={{ color: '#B0B7C3' }}>
                                    No notifications. No algorithms. Just mountains, breath, and silence. We create the space for you to unplug so you can truly recharge.
                                </p>
                            </motion.div>

                            {/* 2. Slow Travel */}
                            <motion.div variants={itemVariants} className="group flex flex-col">
                                <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-2xl">
                                    <img
                                        src="/images/insta-2.webp"
                                        alt="Slow Travel"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 group-hover:bg-transparent transition-colors duration-500" style={{ background: 'rgba(0,0,0,0.2)' }} />
                                </div>
                                <h3
                                    className="text-lg sm:text-xl font-serif mb-2 sm:mb-2.5 group-hover:transition-colors"
                                    style={{ color: 'white' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                                >Slow Travel</h3>
                                <p className="font-light leading-relaxed text-xs sm:text-sm" style={{ color: '#B0B7C3' }}>
                                    It’s not about conquering the peak or ticking off a checklist. It’s about the journey itself—moving gently, noticing deeply, and returning to life at a human pace.
                                </p>
                            </motion.div>

                            {/* 3. Clarity */}
                            <motion.div variants={itemVariants} className="group flex flex-col">
                                <div className="relative aspect-[4/3] mb-5 sm:mb-6 overflow-hidden rounded-2xl shadow-xl">
                                    <img
                                        src="/images/insta-3.jpg"
                                        alt="Clarity"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 transition-all duration-500" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                                </div>
                                <h3
                                    className="text-lg sm:text-xl font-serif mb-2 sm:mb-2.5 group-hover:transition-colors tracking-tight"
                                    style={{ color: 'white' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                                >Clarity of Mind</h3>
                                <p className="font-light leading-relaxed text-xs sm:text-sm" style={{ color: '#B0B7C3' }}>
                                    "Walking away from comfort to walk back to clarity." Nature acts as a mirror, helping you see what really matters when the noise signals fade away.
                                </p>
                            </motion.div>

                            {/* 4. Seasonal Wisdom */}
                            <motion.div variants={itemVariants} className="group flex flex-col lg:col-span-1.5">
                                <div className="relative aspect-video mb-5 sm:mb-6 overflow-hidden rounded-2xl shadow-xl">
                                    <img
                                        src="/images/insta-4.jpg"
                                        alt="Seasonal Wisdom"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 transition-all duration-500" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                                </div>
                                <h3
                                    className="text-lg sm:text-xl font-serif mb-2 sm:mb-2.5 group-hover:transition-colors tracking-tight"
                                    style={{ color: 'white' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                                >Seasonal Rhythm</h3>
                                <p className="font-light leading-relaxed text-xs sm:text-sm" style={{ color: '#B0B7C3' }}>
                                    We embrace the distinct beauty of every season. From the warmth of winter kitchens and wood fires to the vibrant life of summer meadows, each journey is tuned to the time of year.
                                </p>
                            </motion.div>

                            {/* 5. Community */}
                            <motion.div variants={itemVariants} className="group flex flex-col lg:col-span-1.5">
                                <div className="relative aspect-video mb-5 sm:mb-6 overflow-hidden rounded-2xl shadow-xl">
                                    <img
                                        src="/images/insta-5.jpg"
                                        alt="Community"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 transition-all duration-500" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                                </div>
                                <h3
                                    className="text-lg sm:text-xl font-serif mb-2 sm:mb-2.5 group-hover:transition-colors tracking-tight"
                                    style={{ color: 'white' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#5CE1E6'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                                >Intentional Community</h3>
                                <p className="font-light leading-relaxed text-xs sm:text-sm" style={{ color: '#B0B7C3' }}>
                                    Travel with a purpose, in small groups. Engage in deep conversations and forge connections that go beyond the trail. Strangers become friends in the shared silence of the wild.
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>
                {/* Call to Action Section */}
                <section className="py-14 sm:py-16 md:py-20 relative overflow-hidden flex items-center" style={{ background: '#1a1d2e' }}>
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#5CE1E6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="container mx-auto px-5 sm:px-6 text-center relative z-10"
                        style={{ color: 'white' }}
                    >
                        <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 tracking-tight" style={{ color: 'white' }}>
                            Start Your Journey
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-2xl mx-auto font-light leading-relaxed px-3" style={{ color: '#B0B7C3' }}>
                            Join a community of intentional travelers and discover the world at your own pace.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto px-3">
                            <Link to="/journeys" className="w-full sm:w-auto">
                                <button
                                    className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 inline-flex items-center justify-center gap-2 group"
                                    style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}
                                >
                                    <span>View All Journeys</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link to="/signup" className="w-full sm:w-auto">
                                <button
                                    className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-bold rounded-xl border-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all"
                                    style={{ color: 'white', borderColor: '#5CE1E6', background: '#1e2139' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#1a1d2e'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#1e2139'}
                                >
                                    Become a Member
                                </button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>
            </div>
        </>
    )
}
