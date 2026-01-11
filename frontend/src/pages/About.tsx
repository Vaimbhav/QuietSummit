import { motion } from 'framer-motion'
import { Heart, Compass, Users, Leaf, Mountain, Award, Quote, ChevronRight, TrendingUp, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function About() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-linear-to-br from-primary-600 via-accent-600 to-primary-700 text-white pt-16 pb-16 md:pt-20 md:pb-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 text-7xl">🏔️</div>
                    <div className="absolute bottom-20 right-10 text-7xl">🌲</div>
                    <div className="absolute top-40 right-1/4 text-5xl">✨</div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto px-4 text-center relative z-10"
                >
                    <div className="inline-block px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-6 tracking-wide uppercase">
                        Who We Are
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
                        We Create Journeys<br />That Transform
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed font-light">
                        More than a travel company—we're your partners in discovering the extraordinary within the ordinary.
                    </p>
                </motion.div>
            </section>

            {/* Team Section - Founders */}
            <section className="bg-white py-12 md:py-20">
                <div className="container mx-auto px-4 -mt-24 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-6xl mx-auto"
                    >
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={containerVariants}
                        >
                            <motion.div variants={itemVariants} className="text-center mb-12">
                                <div className="mb-4 inline-flex items-center gap-2 text-primary-600">
                                    <Users className="w-4 h-4" />
                                    <span className="font-medium tracking-wide uppercase text-xs">The Founders</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
                                    Meet the Team
                                </h2>
                                <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
                                    IIT Roorkee alumni united by a shared vision: making travel meaningful and intentional.
                                </p>
                            </motion.div>

                            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                                {[
                                    {
                                        name: 'Nagendra Rajput',
                                        role: 'Founder & CEO',
                                        image: '/images/founders/Nagendra.jpg',
                                        bio: 'IIT Roorkee alumnus with a vision to transform travel into meaningful experiences. Combines engineering precision with a passion for the mountains.',
                                        passion: 'Redefining travel through intentionality',
                                        education: 'IIT Roorkee'
                                    },
                                    {
                                        name: 'Shiv Prakash',
                                        role: 'Co-Founder & Operations Lead',
                                        image: '/images/founders/Shiv-Prakash.jpg',
                                        bio: 'IIT Roorkee graduate with expertise in operations and logistics. Ensures every journey runs seamlessly from start to finish.',
                                        passion: 'Excellence in execution'
                                    },
                                    {
                                        name: 'Mihir Chawla',
                                        role: 'Co-Founder & Technology Lead',
                                        image: '/images/founders/Mihir.jpg',
                                        bio: 'IIT Roorkee alumnus with a passion for building meaningful digital experiences. Combines technical expertise with a love for the mountains.',
                                        passion: 'Building technology that connects people to nature'
                                    }
                                ].map((member, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="bg-neutral-50 rounded-2xl p-7 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="w-32 h-32 mx-auto mb-5 rounded-2xl overflow-hidden shadow-md">
                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                        </div>

                                        <h3 className="text-xl font-bold text-neutral-900 mb-2 text-center">
                                            {member.name}
                                        </h3>

                                        <div className="px-3 py-1.5 bg-neutral-900 text-white text-center text-xs font-medium uppercase tracking-wider rounded-lg mb-4 inline-block w-full">
                                            {member.role}
                                        </div>

                                        <p className="text-neutral-600 leading-relaxed mb-4 text-center text-sm">
                                            {member.bio}
                                        </p>

                                        <div className="pt-4 border-t border-neutral-200 text-center">
                                            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-2">
                                                Passionate About
                                            </div>
                                            <div className="text-sm font-medium text-neutral-900 italic">
                                                "{member.passion}"
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <section className="py-12 md:py-20 bg-neutral-900 text-white">
                <div className="container mx-auto px-4">
                    {/* Origin Story Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10 md:p-14 max-w-4xl mx-auto"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <Quote className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center tracking-tight">
                            It Started With a Simple Question
                        </h2>
                        <div className="space-y-5 text-base text-neutral-300 leading-relaxed">
                            <p className="text-lg md:text-xl text-center font-light text-white italic mb-6">
                                "What if travel wasn't about seeing more, but feeling more?"
                            </p>
                            <p>
                                In 2018, after years of rushing through bucket-list destinations and collecting passport stamps, our founder had an epiphany during a quiet morning in the Himalayas. Sitting by a mountain stream, watching the mist slowly reveal the peaks, she realized that the most profound travel experiences had nothing to do with the number of places visited.
                            </p>
                            <p>
                                They came from moments of stillness. From conversations with locals over home-cooked meals. From watching sunrise alone on a mountain trail. From the space between destinations where transformation actually happens.
                            </p>
                            <p className="text-lg font-medium text-white mt-6">
                                That morning, QuietSummit was born—not as a business plan, but as a commitment to create journeys that honor depth over distance, connection over collection.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* What Makes Us Different */}
            <section className="py-12 md:py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-14">
                            <div className="mb-4 inline-flex items-center gap-2 text-primary-600">
                                <Compass className="w-4 h-4" />
                                <span className="font-medium tracking-wide uppercase text-xs">Our Difference</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
                                What Makes Us Different
                            </h2>
                            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
                                We don't just plan trips—we design transformative experiences that reconnect you with what matters most.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    icon: <Compass className="w-12 h-12" />,
                                    title: 'Intentional Design',
                                    description: 'Every moment is purposefully crafted. We spend months researching, building relationships with local communities, and refining each journey to ensure authenticity and depth.',
                                    highlight: 'No cookie-cutter tours'
                                },
                                {
                                    icon: <Users className="w-12 h-12" />,
                                    title: 'Small Group Philosophy',
                                    description: 'Maximum 12 travelers per journey. This isn\'t about economics—it\'s about creating intimate experiences where real connections form and meaningful conversations happen naturally.',
                                    highlight: 'Intimate, never crowded'
                                },
                                {
                                    icon: <Heart className="w-12 h-12" />,
                                    title: 'Local First Approach',
                                    description: 'We work exclusively with local guides, family-run accommodations, and community initiatives. Your journey directly supports the places and people you visit.',
                                    highlight: '100% locally partnered'
                                },
                                {
                                    icon: <Leaf className="w-12 h-12" />,
                                    title: 'Sustainable by Design',
                                    description: 'Environmental and cultural responsibility isn\'t an add-on—it\'s woven into every decision. Carbon-conscious travel, waste reduction, and respect for local customs are non-negotiable.',
                                    highlight: 'Carbon offset included'
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="bg-neutral-50 rounded-2xl p-7 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="p-3 bg-neutral-900 rounded-xl text-white shadow-sm shrink-0">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">
                                                {feature.title}
                                            </h3>
                                            <p className="text-neutral-600 leading-relaxed mb-3 text-sm">
                                                {feature.description}
                                            </p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white rounded-full text-xs font-medium">
                                                <ChevronRight className="w-3 h-3" />
                                                {feature.highlight}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-12 md:py-20 bg-neutral-900 text-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold mb-5 tracking-tight">
                                Our Philosophy
                            </h2>
                            <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-light">
                                These aren't just values on a wall—they're principles we live by every single day.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-7">
                            {[
                                {
                                    emoji: '🐌',
                                    title: 'Embrace Slowness',
                                    description: 'In a world that glorifies speed, we champion the radical act of slowing down. Real transformation doesn\'t happen at 100mph.',
                                    principle: 'Depth over distance, always.'
                                },
                                {
                                    emoji: '🎯',
                                    title: 'Travel With Purpose',
                                    description: 'Every journey has intention. Every destination tells a story. We don\'t just go places—we understand them, respect them, learn from them.',
                                    principle: 'Meaning over miles.'
                                },
                                {
                                    emoji: '🌱',
                                    title: 'Leave It Better',
                                    description: 'We believe travel should give back more than it takes. Environmental stewardship and cultural respect aren\'t optional—they\'re essential.',
                                    principle: 'Positive impact, guaranteed.'
                                }
                            ].map((value, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="text-center bg-white/5 rounded-2xl p-7 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10"
                                >
                                    <div className="text-5xl mb-5">{value.emoji}</div>
                                    <h3 className="text-xl font-bold mb-3 tracking-tight">
                                        {value.title}
                                    </h3>
                                    <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                                        {value.description}
                                    </p>
                                    <div className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                                        {value.principle}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-12 md:py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-14">
                            <div className="mb-4 inline-flex items-center gap-2 text-primary-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-medium tracking-wide uppercase text-xs">Impact</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
                                Our Impact Story
                            </h2>
                            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
                                Numbers tell part of our story—but the real impact is in the lives we've touched.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-7">
                            {[
                                { value: '850+', label: 'Transformed Travelers', icon: <Users className="w-6 h-6" /> },
                                { value: '20+', label: 'Unique Journeys', icon: <Mountain className="w-6 h-6" /> },
                                { value: '45+', label: 'Local Partners', icon: <Heart className="w-6 h-6" /> },
                                { value: '99%', label: 'Would Recommend', icon: <Award className="w-6 h-6" /> }
                            ].map((stat, index) => (
                                <motion.div key={index} variants={itemVariants} className="text-center bg-neutral-50 rounded-2xl p-7 hover:shadow-md transition-all duration-300">
                                    <div className="flex justify-center mb-3 text-neutral-900">
                                        {stat.icon}
                                    </div>
                                    <div className="text-4xl font-bold mb-2 text-neutral-900">
                                        {stat.value}
                                    </div>
                                    <div className="text-lg opacity-90 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-primary-50/50 rounded-2xl p-8 text-center max-w-3xl mx-auto mt-12 border border-primary-100"
                        >
                            <p className="text-base md:text-lg leading-relaxed italic text-neutral-700">
                                "Beyond the numbers, we've watched strangers become lifelong friends, career-driven professionals find new purpose, and travelers return home not just with photos, but with profound shifts in perspective."
                            </p>
                            <p className="text-sm mt-6 font-medium text-neutral-600">— The QuietSummit Team</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 md:py-20 bg-primary-700 text-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-5 tracking-tight">
                            Ready to Slow Down?
                        </h2>
                        <p className="text-base md:text-lg mb-8 leading-relaxed text-neutral-300 font-light">
                            Your transformation begins with a single step. Let's take it together.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center items-center">
                            <button
                                onClick={() => navigate('/journeys')}
                                className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-extrabold rounded-3xl gradient-premium text-white shadow-luxury-2xl hover:shadow-luxury-xl hover:-translate-y-1 active:translate-y-0 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 inline-flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                                <span className="relative z-10">Explore Journeys</span>
                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-extrabold rounded-3xl glass-luxury text-primary-700 shadow-luxury-lg hover:shadow-luxury-xl hover:-translate-y-1 active:translate-y-0 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 inline-flex items-center justify-center gap-2 relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                                <span className="relative z-10">Let's Talk</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
