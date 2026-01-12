import { Link } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Mountain, Compass, Users, Globe, Leaf, Heart } from 'lucide-react'

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
        <div className="bg-neutral-50 text-neutral-900 font-sans">
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
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-accent-900/20" />
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="container mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10 py-6 sm:py-12 max-w-6xl"
                >
                    <motion.div variants={itemVariants} className="mb-5 sm:mb-8 flex justify-center">
                        <span className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full glass-effect text-primary-900 text-xs sm:text-sm font-bold tracking-wide shadow-lg animate-pulse backdrop-blur-md">
                            ✨ Rediscover the Art of Slow Travel
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-5 sm:mb-8 tracking-tight drop-shadow-2xl px-2"
                    >
                        Find Your{' '}
                        <span className="text-primary-400 relative inline-block animate-glow">
                            Quiet
                            <svg className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-primary-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="10" fill="none" />
                            </svg>
                        </span>{' '}
                        Place
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-sm leading-relaxed sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-8 sm:mb-12 max-w-2xl mx-auto font-light drop-shadow-2xl px-3"
                    >
                        Curated journeys designed to help you disconnect from the noise and reconnect with nature, yourself, and meaningful connections.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-3 max-w-lg sm:max-w-none mx-auto"
                    >
                        <Link to="/journeys" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-extrabold rounded-2xl sm:rounded-3xl gradient-premium text-white shadow-2xl hover:shadow-xl active:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-300 inline-flex items-center justify-center gap-3 group relative overflow-hidden">
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                                <span className="relative z-10">Explore Journeys</span>
                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                        <Link to="/about" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-extrabold rounded-2xl sm:rounded-3xl bg-white text-primary-900 shadow-xl hover:shadow-2xl active:shadow-lg hover:-translate-y-1 active:translate-y-0 hover:bg-primary-50 transition-all duration-300 inline-flex items-center justify-center gap-2 relative overflow-hidden group">
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                                <span className="relative z-10">Our Philosophy</span>
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Enhanced scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white hidden sm:flex"
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

            {/* Quick Stats Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-primary-50/30 to-white relative z-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="container mx-auto px-4 sm:px-6"
                >
                    <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
                        {[
                            { value: '12+', label: 'Curated Journeys', icon: Mountain },
                            { value: '500+', label: 'Happy Travelers', icon: Users },
                            { value: '8', label: 'Countries', icon: Globe }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                className="text-center group p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 border border-neutral-100 hover:border-primary-200"
                            >
                                <div className="mb-3 sm:mb-4 inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary-600 mb-1.5 sm:mb-2 tracking-tight">{stat.value}</h3>
                                <p className="text-neutral-600 font-bold uppercase tracking-wider text-[9px] leading-tight sm:text-xs">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Philosophy Section */}
            <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-neutral-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-800/20 blur-3xl -translate-y-1/2 translate-x-1/4 rounded-full" />
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-primary-900/20 blur-3xl translate-y-1/2 -translate-x-1/4 rounded-full" />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="container mx-auto px-5 sm:px-6 text-center max-w-4xl relative z-10"
                >
                    <motion.div variants={itemVariants} className="mb-5 sm:mb-6 inline-flex items-center gap-2 text-primary-400 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-bold tracking-widest uppercase text-xs sm:text-sm">Our Philosophy</span>
                    </motion.div>

                    <motion.h2 variants={itemVariants} className="text-2xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-5 sm:mb-8 px-3">
                        In a world that moves too fast, <br className="hidden sm:block" />
                        we create spaces for <span className="text-primary-400 italic">slowness</span>.
                    </motion.h2>

                    <motion.p variants={itemVariants} className="text-sm leading-relaxed sm:text-lg md:text-xl text-neutral-300 mb-8 sm:mb-12 font-light max-w-2xl mx-auto px-3">
                        Our journeys are not about ticking boxes. They are about deep immersion,
                        meaningful conversations, and the transformative power of nature.
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <Link to="/about">
                            <button className="px-10 py-5 text-lg font-bold rounded-3xl border-2 border-primary-400 text-white hover:bg-primary-400 hover:text-neutral-900 transition-all duration-300 shadow-luxury-lg hover:shadow-luxury-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group">
                                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                                <span className="relative z-10 font-extrabold">Read Our Manifesto</span>
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-14 sm:py-20 md:py-24 bg-white">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="container mx-auto px-5 sm:px-6"
                >
                    <motion.div variants={itemVariants} className="text-center mb-10 sm:mb-12 px-3">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 mb-3 sm:mb-4 tracking-tight">The Quiet Difference</h2>
                        <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                            Experience travel that prioritizes depth over distance and quality over quantity.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
                        {[
                            {
                                icon: Leaf,
                                title: 'Sustainable by Design',
                                description: 'We prioritize eco-friendly accommodations and support local economies, leaving a positive footprint wherever we go.'
                            },
                            {
                                icon: Users,
                                title: 'Intimate Groups',
                                description: 'Small group sizes (max 12) ensure personalized attention, flexibility, and the opportunity for genuine connection.'
                            },
                            {
                                icon: Heart,
                                title: 'Mindful Experiences',
                                description: 'We build in time for reflection, meditation, and simply "being" in the destination, rather than just "seeing" it.'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ y: -6 }}
                            >
                                <div className="h-full p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-white border-2 border-neutral-100 hover:border-primary-200 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 group">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black text-neutral-900 mb-2.5 sm:mb-3 tracking-tight">{feature.title}</h3>
                                    <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Our Philosophy Section (Repurposed Visuals) */}
            <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-neutral-900 text-white overflow-hidden">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="container mx-auto px-5 sm:px-6"
                >
                    <motion.div variants={itemVariants} className="text-center mb-10 sm:mb-14 md:mb-16 px-3">
                        <div className="inline-flex items-center gap-2 text-primary-400 mb-4 sm:mb-5 bg-white/5 px-5 py-2.5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
                            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">Our Approach</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-4 sm:mb-6 leading-tight">Why We Go to the Wild</h2>
                        <p className="text-neutral-300 max-w-2xl mx-auto font-light text-sm sm:text-base md:text-lg leading-relaxed">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent group-hover:from-black/30 transition-all duration-500" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-serif mb-2.5 sm:mb-3 text-white group-hover:text-primary-400 transition-colors tracking-tight">The Art of Disconnecting</h3>
                            <p className="text-neutral-300 font-light leading-relaxed text-sm sm:text-base">
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
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                            <h3 className="text-2xl font-serif mb-3 text-white group-hover:text-primary-400 transition-colors">Slow Travel</h3>
                            <p className="text-neutral-400 font-light leading-relaxed">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent group-hover:from-black/30 transition-all duration-500" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-serif mb-2.5 sm:mb-3 text-white group-hover:text-primary-400 transition-colors tracking-tight">Clarity of Mind</h3>
                            <p className="text-neutral-300 font-light leading-relaxed text-sm sm:text-base">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent group-hover:from-black/30 transition-all duration-500" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-serif mb-2.5 sm:mb-3 text-white group-hover:text-primary-400 transition-colors tracking-tight">Seasonal Rhythm</h3>
                            <p className="text-neutral-300 font-light leading-relaxed text-sm sm:text-base">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent group-hover:from-black/30 transition-all duration-500" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-serif mb-2.5 sm:mb-3 text-white group-hover:text-primary-400 transition-colors tracking-tight">Intentional Community</h3>
                            <p className="text-neutral-300 font-light leading-relaxed text-sm sm:text-base">
                                Travel with a purpose, in small groups. Engage in deep conversations and forge connections that go beyond the trail. Strangers become friends in the shared silence of the wild.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </section>
            <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden flex items-center">
                <div className="absolute inset-0 bg-primary-900">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="container mx-auto px-5 sm:px-6 text-center text-white relative z-10"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tight">
                        Start Your Journey
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto text-primary-50 font-light leading-relaxed px-3">
                        Join a community of intentional travelers and discover the world at your own pace.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center max-w-md sm:max-w-none mx-auto px-3">
                        <Link to="/journeys" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-white text-primary-900 hover:bg-primary-50 active:bg-white transition-all shadow-2xl hover:shadow-3xl active:shadow-xl hover:-translate-y-1 active:translate-y-0 inline-flex items-center justify-center gap-2.5 group">
                                <span>View All Journeys</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link to="/signup" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-primary-600 text-white border-2 border-primary-500 hover:bg-primary-500 active:bg-primary-600 transition-all shadow-xl hover:shadow-2xl active:shadow-lg hover:-translate-y-1 active:translate-y-0">
                                Become a Member
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    )
}
