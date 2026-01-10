import { motion } from 'framer-motion'
import { Heart, Compass, Users, Leaf, Mountain, Award, Quote, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@components/common/Button'

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
            <section className="relative bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 text-white pt-32 pb-40 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 text-9xl">🏔️</div>
                    <div className="absolute bottom-20 right-10 text-9xl">🌲</div>
                    <div className="absolute top-40 right-1/4 text-7xl">✨</div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto px-4 text-center relative z-10"
                >
                    <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 tracking-wide">
                        WHO WE ARE
                    </div>
                    <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
                        We Create Journeys<br />That Transform
                    </h1>
                    <p className="text-2xl md:text-3xl opacity-95 max-w-4xl mx-auto leading-relaxed font-light">
                        More than a travel company—we're your partners in discovering the extraordinary within the ordinary.
                    </p>
                </motion.div>
            </section>

            <div className="container mx-auto px-4 -mt-24 relative z-20 mb-20">
                {/* Origin Story Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-2xl p-12 md:p-16 max-w-5xl mx-auto"
                >
                    <div className="flex items-center justify-center mb-8">
                        <Quote className="w-12 h-12 text-primary-600" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-8 text-center tracking-tight">
                        It Started With a Simple Question
                    </h2>
                    <div className="space-y-6 text-lg text-neutral-700 leading-relaxed">
                        <p className="text-xl md:text-2xl text-center font-light text-primary-700 italic mb-8">
                            "What if travel wasn't about seeing more, but feeling more?"
                        </p>
                        <p>
                            In 2018, after years of rushing through bucket-list destinations and collecting passport stamps, our founder had an epiphany during a quiet morning in the Himalayas. Sitting by a mountain stream, watching the mist slowly reveal the peaks, she realized that the most profound travel experiences had nothing to do with the number of places visited.
                        </p>
                        <p>
                            They came from moments of stillness. From conversations with locals over home-cooked meals. From watching sunrise alone on a mountain trail. From the space between destinations where transformation actually happens.
                        </p>
                        <p className="text-xl font-semibold text-neutral-900">
                            That morning, QuietSummit was born—not as a business plan, but as a commitment to create journeys that honor depth over distance, connection over collection.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* What Makes Us Different */}
            <section className="py-20 bg-gradient-to-b from-neutral-50 to-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-16">
                            <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 tracking-tight">
                                What Makes Us Different
                            </h2>
                            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
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
                                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100"
                                >
                                    <div className="flex items-start gap-6">
                                        <div className="p-4 bg-primary-100 rounded-2xl text-primary-700 flex-shrink-0">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
                                                {feature.title}
                                            </h3>
                                            <p className="text-neutral-700 leading-relaxed mb-4">
                                                {feature.description}
                                            </p>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 rounded-full text-sm font-bold">
                                                <ChevronRight className="w-4 h-4" />
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
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-16">
                            <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 tracking-tight">
                                Our Philosophy
                            </h2>
                            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                                These aren't just values on a wall—they're principles we live by every single day.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
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
                                    className="text-center bg-neutral-50 rounded-2xl p-8 hover:bg-neutral-100 transition-all duration-300"
                                >
                                    <div className="text-7xl mb-6">{value.emoji}</div>
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
                                        {value.title}
                                    </h3>
                                    <p className="text-neutral-700 leading-relaxed mb-6">
                                        {value.description}
                                    </p>
                                    <div className="text-sm font-bold text-primary-700 uppercase tracking-wider">
                                        {value.principle}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-16">
                            <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 tracking-tight">
                                Meet the Dreamers
                            </h2>
                            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                                A diverse team united by one mission: making travel meaningful again.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    name: 'Priya Sharma',
                                    role: 'Founder & Journey Architect',
                                    emoji: '👩‍💼',
                                    bio: 'Former corporate executive who traded boardrooms for mountain trails. 15 years of travel experience across 50+ countries.',
                                    passion: 'Creating spaces for transformation'
                                },
                                {
                                    name: 'Arjun Mehta',
                                    role: 'Sustainability & Community Lead',
                                    emoji: '🌿',
                                    bio: 'Environmental scientist passionate about regenerative tourism. Works closely with local communities to ensure positive impact.',
                                    passion: 'Building bridges, not barriers'
                                },
                                {
                                    name: 'Maya Desai',
                                    role: 'Experience Designer',
                                    emoji: '✨',
                                    bio: 'Cultural anthropologist and storyteller. Designs every touchpoint to ensure authenticity and depth in each journey.',
                                    passion: 'Crafting moments that matter'
                                }
                            ].map((member, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100"
                                >
                                    <div className="text-8xl mb-6 text-center">{member.emoji}</div>
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-2 text-center tracking-tight">
                                        {member.name}
                                    </h3>
                                    <p className="text-primary-600 font-bold text-center mb-6 text-sm uppercase tracking-wider">
                                        {member.role}
                                    </p>
                                    <p className="text-neutral-700 leading-relaxed mb-4 text-center">
                                        {member.bio}
                                    </p>
                                    <div className="pt-4 border-t border-neutral-200 text-center">
                                        <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wide mb-2">
                                            Passionate About
                                        </div>
                                        <div className="text-sm font-bold text-accent-700 italic">
                                            {member.passion}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-20 bg-neutral-900 text-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-16">
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                                Our Impact Story
                            </h2>
                            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                                Numbers tell part of our story—but the real impact is in the lives we've touched.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-4 gap-8 mb-12">
                            {[
                                { value: '850+', label: 'Transformed Travelers', icon: <Users className="w-8 h-8" /> },
                                { value: '20+', label: 'Unique Journeys', icon: <Mountain className="w-8 h-8" /> },
                                { value: '45+', label: 'Local Partners', icon: <Heart className="w-8 h-8" /> },
                                { value: '99%', label: 'Would Recommend', icon: <Award className="w-8 h-8" /> }
                            ].map((stat, index) => (
                                <motion.div key={index} variants={itemVariants} className="text-center">
                                    <div className="flex justify-center mb-4 text-primary-400">
                                        {stat.icon}
                                    </div>
                                    <div className="text-6xl font-bold mb-3 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                                        {stat.value}
                                    </div>
                                    <div className="text-lg opacity-90 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-3xl mx-auto border border-white/20"
                        >
                            <p className="text-xl leading-relaxed italic">
                                "Beyond the numbers, we've watched strangers become lifelong friends, career-driven professionals find new purpose, and travelers return home not just with photos, but with profound shifts in perspective."
                            </p>
                            <p className="text-sm mt-6 font-semibold opacity-75">— The QuietSummit Team</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 text-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                            Ready to Slow Down?
                        </h2>
                        <p className="text-2xl mb-10 leading-relaxed opacity-95">
                            Your transformation begins with a single step. Let's take it together.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => navigate('/journeys')}
                                variant="primary"
                                size="lg"
                                className="bg-white text-primary-700 hover:bg-neutral-100 text-lg font-bold px-10 py-4"
                            >
                                Explore Our Journeys
                            </Button>
                            <Button
                                onClick={() => navigate('/contact')}
                                variant="ghost"
                                size="lg"
                                className="border-2 border-white text-white hover:bg-white/10 text-lg font-bold px-10 py-4"
                            >
                                Let's Talk
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
