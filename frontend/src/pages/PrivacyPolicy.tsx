import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Users, Database, Bell, Mail } from 'lucide-react';

const sections = [
    {
        title: "1. Information We Collect",
        icon: Database,
        content: [
            {
                subtitle: "Personal Information",
                text: "Name, email, phone, age, gender, address, emergency contacts for bookings and safety."
            },
            {
                subtitle: "Payment Information",
                text: "Processed via Razorpay. We don't store card details, only transaction references."
            },
            {
                subtitle: "Travel Preferences",
                text: "Dietary restrictions, medical conditions, special requirements for personalized journeys."
            },
            {
                subtitle: "Usage Information",
                text: "IP address, browser type, pages visited, time spent to improve our services."
            }
        ]
    },
    {
        title: "2. How We Use Your Information",
        icon: Users,
        content: [
            {
                subtitle: "Service Delivery",
                text: "Process bookings, coordinate journeys, communicate trip info, provide support."
            },
            {
                subtitle: "Communication",
                text: "Booking confirmations, trip updates, pre-departure info, feedback requests, newsletters (opt-out anytime)."
            },
            {
                subtitle: "Improvement & Analytics",
                text: "Analyze usage data in aggregate to improve website and user experience."
            },
            {
                subtitle: "Legal Compliance",
                text: "Comply with legal obligations, respond to authorities, protect rights, prevent fraud."
            }
        ]
    },
    {
        title: "3. Information Sharing and Disclosure",
        icon: Eye,
        content: [
            {
                subtitle: "Service Providers",
                text: "We share necessary info with accommodation, transport, activity, and payment providers. They're contractually bound to protect your data."
            },
            {
                subtitle: "Legal Requirements",
                text: "We disclose information when required by law or to protect rights and safety."
            },
            {
                subtitle: "Business Transfers",
                text: "In mergers/acquisitions, your info may transfer to the new entity with same protections."
            },
            {
                subtitle: "Marketing Partners",
                text: "We don't sell personal info. May share aggregated, non-identifiable data for analytics."
            }
        ]
    },
    {
        title: "4. Data Security",
        icon: Lock,
        content: [
            {
                subtitle: "Security Measures",
                text: "Industry-standard encryption, secure servers, firewalls, regular audits protect your data."
            },
            {
                subtitle: "Access Controls",
                text: "Only authorized personnel access data. All bound by confidentiality."
            },
            {
                subtitle: "Data Retention",
                text: "Data retained as needed for services or legal compliance. Booking records kept 7 years for tax/legal purposes."
            }
        ]
    },
    {
        title: "5. Your Rights and Choices",
        icon: Shield,
        content: [
            {
                subtitle: "Access and Correction",
                text: "Access and update your info via your account or by contacting us."
            },
            {
                subtitle: "Data Deletion",
                text: "Request deletion (subject to legal requirements). May affect service availability."
            },
            {
                subtitle: "Marketing Opt-Out",
                text: "Unsubscribe from marketing emails anytime. Doesn't affect booking communications."
            },
            {
                subtitle: "Cookie Preferences",
                text: "Control cookies via browser settings. Disabling may affect functionality."
            }
        ]
    },
    {
        title: "6. Cookies and Tracking Technologies",
        icon: Database,
        content: [
            {
                subtitle: "What We Use",
                text: "Cookies, web beacons to enhance experience, remember preferences, analyze traffic."
            },
            {
                subtitle: "Types of Cookies",
                text: "Essential (core functionality), Analytics (visitor insights), Marketing (relevant ads)."
            }
        ]
    },
    {
        title: "7. Third-Party Links",
        icon: Eye,
        content: [
            {
                subtitle: "",
                text: "Our site may link to external websites. We're not responsible for their privacy practices. Review their policies before sharing info."
            }
        ]
    },
    {
        title: "8. Children's Privacy",
        icon: Shield,
        content: [
            {
                subtitle: "",
                text: "Not for under 18. We don't knowingly collect children's data. Parents: contact us if your child provided info."
            }
        ]
    },
    {
        title: "9. International Data Transfers",
        icon: Database,
        content: [
            {
                subtitle: "",
                text: "Data may be transferred/processed internationally. Appropriate safeguards ensure protection per this policy."
            }
        ]
    },
    {
        title: "10. Changes to This Policy",
        icon: Bell,
        content: [
            {
                subtitle: "",
                text: "We may update this policy. Significant changes notified via email/website. Continued use means you accept updates."
            }
        ]
    },
    {
        title: "11. Contact Us",
        icon: Mail,
        content: [
            {
                subtitle: "",
                text: "Questions or requests about your personal information? Email: Nagendrarajput9753@gmail.com | WhatsApp: +91 99680 86660"
            }
        ]
    }
];

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl mb-6">
                            <Shield className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6">Privacy Policy</h1>
                        <p className="text-xl md:text-2xl opacity-90 mb-4">
                            Your privacy and data security are our top priorities
                        </p>
                        <p className="text-lg opacity-80">
                            Last updated: January 21, 2026
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-white/50 p-8 md:p-10 mb-12"
                >
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                        At QuietSummit, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your information when you use our website and services.
                    </p>
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                        By using our services, you consent to the collection and use of your information as described in this policy. Please read this policy carefully to understand our practices.
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-8">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (index * 0.05) }}
                                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-white/50 p-8 md:p-10"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                                        {section.title}
                                    </h2>
                                </div>

                                <div className="space-y-6 pl-0 md:pl-16">
                                    {section.content.map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            {item.subtitle && (
                                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                    {item.subtitle}
                                                </h3>
                                            )}
                                            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg p-8 md:p-10 border-2 border-green-200"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center">
                            <Lock className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900">Your Data is Safe With Us</h3>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        We use industry-leading security measures to protect your personal information. Your trust is important to us, and we are committed to maintaining the highest standards of data protection and privacy.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
