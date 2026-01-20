import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, MessageCircle, Mail, MessageSquare } from 'lucide-react';

const faqs = [
    {
        category: "Booking & Payments",
        questions: [
            {
                q: "How do I book a journey with QuietSummit?",
                a: "Browse journeys, select dates, and complete checkout. You'll receive instant email confirmation."
            },
            {
                q: "What payment methods do you accept?",
                a: "Credit/debit cards, UPI, net banking, and digital wallets via Razorpay."
            },
            {
                q: "Can I modify or cancel my booking?",
                a: "Full refund if cancelled 7+ days before departure. Cancellations within 7 days follow our cancellation policy in your booking confirmation."
            },
            {
                q: "Do I need to pay the full amount upfront?",
                a: "30+ days advance: 30% upfront, 70% due 15 days before departure. Otherwise, full payment required."
            }
        ]
    },
    {
        category: "Journey Details",
        questions: [
            {
                q: "What's included in the journey price?",
                a: "Accommodation, guided experiences, select meals, local transportation, and expert guides. Check each trip page for specific inclusions."
            },
            {
                q: "What should I pack for my journey?",
                a: "Detailed packing list sent 30 days before departure. Essentials: comfortable shoes, weather-appropriate clothing, personal items."
            },
            {
                q: "Are meals provided during the journey?",
                a: "Most journeys include breakfast and select meals. Specific inclusions listed in journey details."
            },
            {
                q: "What is the group size for journeys?",
                a: "6-12 travelers per journey for personalized attention."
            }
        ]
    },
    {
        category: "Travel & Safety",
        questions: [
            {
                q: "Do I need travel insurance?",
                a: "While not mandatory, we strongly recommend comprehensive travel insurance covering medical emergencies, trip cancellations, and lost baggage. We can provide recommendations for trusted insurance providers."
            },
            {
                q: "What if there's a medical emergency during the journey?",
                a: "Our guides are trained in first aid and emergency response. We maintain 24/7 emergency contact lines and have partnerships with local medical facilities in all our destinations."
            },
            {
                q: "Are your journeys suitable for solo travelers?",
                a: "Absolutely! Many of our travelers journey solo and find it a wonderful way to meet like-minded people. We offer both shared and private accommodation options to suit your preference."
            },
            {
                q: "What is your COVID-19 policy?",
                a: "We follow all government guidelines and implement enhanced safety measures. These may include vaccination requirements, regular sanitization, smaller group sizes, and flexible booking policies. Check your journey page for specific requirements."
            }
        ]
    },
    {
        category: "Sustainability & Community",
        questions: [
            {
                q: "How does QuietSummit practice sustainable travel?",
                a: "We partner with local communities, minimize our environmental footprint, support conservation efforts, and ensure fair wages for all our partners. We're committed to leaving destinations better than we found them."
            },
            {
                q: "How do you support local communities?",
                a: "A significant portion of journey fees goes directly to local communities. We employ local guides, stay in community-run accommodations, and source food and supplies locally whenever possible."
            }
        ]
    }
];

export default function FAQs() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    const filteredFaqs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(faq =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-primary-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl mb-6">
                            <HelpCircle className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6">Frequently Asked Questions</h1>
                        <p className="text-xl md:text-2xl opacity-90 mb-8">
                            Find answers to common questions about QuietSummit journeys
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for answers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-16 pr-6 py-5 bg-white text-gray-900 rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50 transition-all text-lg"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-600 mb-4">No results found for "{searchQuery}"</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-primary-600 font-semibold hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {filteredFaqs.map((category, catIndex) => (
                            <motion.div
                                key={category.category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: catIndex * 0.1 }}
                            >
                                <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-2 h-10 bg-gradient-to-b from-primary-500 to-emerald-500 rounded-full"></div>
                                    {category.category}
                                </h2>

                                <div className="space-y-4">
                                    {category.questions.map((faq, qIndex) => {
                                        const questionId = `${category.category}-${qIndex}`;
                                        const isOpen = openQuestion === questionId;

                                        return (
                                            <motion.div
                                                key={qIndex}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: (catIndex * 0.1) + (qIndex * 0.05) }}
                                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-2 border-white/50"
                                            >
                                                <button
                                                    onClick={() => setOpenQuestion(isOpen ? null : questionId)}
                                                    className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="text-lg md:text-xl font-bold text-gray-900 pr-4">
                                                        {faq.q}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-6 h-6 text-primary-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                                            }`}
                                                    />
                                                </button>

                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <div className="px-6 md:px-8 pb-6 pt-2 text-base md:text-lg text-gray-700 leading-relaxed border-t border-gray-100">
                                                                {faq.a}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Still Have Questions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16"
                >
                    <div className="bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-6" strokeWidth={2} />
                        <h2 className="text-3xl md:text-4xl font-black mb-4">Still Have Questions?</h2>
                        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Need help? Reach out anytime.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a
                                href="mailto:Nagendrarajput9753@gmail.com"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-50 transition-all hover:scale-105 shadow-lg"
                            >
                                <Mail className="w-5 h-5" />
                                Email Us
                            </a>
                            <a
                                href="https://wa.me/919968086660"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/30 transition-all hover:scale-105 border-2 border-white/30"
                            >
                                <MessageSquare className="w-5 h-5" />
                                DM Us
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
