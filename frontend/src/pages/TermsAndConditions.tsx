import { motion } from 'framer-motion';
import { FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const sections = [
    {
        title: "1. Acceptance of Terms",
        icon: CheckCircle,
        content: [
            "By using QuietSummit, you agree to these terms. If you disagree, don't use our services.",
            "We may update these terms anytime. Continued use means you accept changes."
        ]
    },
    {
        title: "2. Booking and Payment",
        icon: FileText,
        content: [
            "Bookings confirmed upon full payment and email confirmation.",
            "Payment via credit/debit cards, UPI, net banking, digital wallets.",
            "30+ days advance bookings: 30% deposit upfront, 70% due 15 days before departure.",
            "Prices in INR, taxes included unless stated."
        ]
    },
    {
        title: "3. Cancellation and Refund Policy",
        icon: AlertCircle,
        content: [
            "Cancellations made 30+ days before departure: 100% refund minus 5% processing fee",
            "Cancellations made 15-29 days before departure: 75% refund",
            "Cancellations made 7-14 days before departure: 50% refund",
            "Cancellations made less than 7 days before departure: No refund",
            "Refunds will be processed within 7-10 business days to the original payment method.",
            "In case of cancellation by QuietSummit due to unforeseen circumstances, a full refund or credit for a future journey will be provided."
        ]
    },
    {
        title: "4. Modifications and Changes",
        icon: FileText,
        content: [
            "Modification requests must be in writing, subject to availability.",
            "30+ days before: 10% modification fee.",
            "Within 30 days: Treated as cancellation/rebooking per our policy.",
            "We may modify itineraries for weather, safety, or unforeseen circumstances."
        ]
    },
    {
        title: "5. Traveler Responsibilities",
        icon: Shield,
        content: [
            "Provide accurate booking information and update us of changes.",
            "Ensure valid travel documents (passport, visas, permits).",
            "Maintain adequate travel insurance.",
            "Follow guide instructions for safety.",
            "You're responsible for personal belongings.",
            "Respect local customs, cultures, and environments."
        ]
    },
    {
        title: "6. Health and Safety",
        icon: Shield,
        content: [
            "Disclose medical conditions, allergies, dietary restrictions at booking.",
            "Journeys involve physical activity. Ensure fitness and consult physician if needed.",
            "24/7 emergency protocols and contacts available.",
            "Adventure travel has inherent risks. You participate at your own risk."
        ]
    },
    {
        title: "7. Liability and Insurance",
        icon: Shield,
        content: [
            "We act as agent for providers. Not liable for their actions.",
            "Not responsible for delays/cancellations due to weather, disasters, or force majeure.",
            "Liability limited to journey cost. Not liable for indirect losses.",
            "Travel insurance strongly recommended."
        ]
    },
    {
        title: "8. Intellectual Property",
        icon: FileText,
        content: [
            "All website content is our intellectual property or used with permission.",
            "No reproduction/distribution without written permission.",
            "Journey photos/videos may be used for marketing unless you opt out in writing."
        ]
    },
    {
        title: "9. Privacy and Data Protection",
        icon: Shield,
        content: [
            "Data collected per our Privacy Policy and applicable laws.",
            "Information used for services only, shared only for journey fulfillment.",
            "You can access, correct, or delete your data—contact us."
        ]
    },
    {
        title: "10. Dispute Resolution",
        icon: AlertCircle,
        content: [
            "Disputes governed by Indian law.",
            "Direct communication encouraged. Unresolved disputes subject to Delhi, India courts."
        ]
    },
    {
        title: "11. Contact Information",
        icon: FileText,
        content: [
            "Questions about these terms? Contact us:",
            "Email: Nagendrarajput9753@gmail.com",
            "WhatsApp: +91 99680 86660"
        ]
    }
];

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl mb-6">
                            <FileText className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6">Terms & Conditions</h1>
                        <p className="text-xl md:text-2xl opacity-90">
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
                        Welcome to QuietSummit. These Terms and Conditions outline the rules and regulations for the use of our services and website.
                    </p>
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                        Please read these terms carefully before using our services. By booking a journey or using our website, you acknowledge that you have read, understood, and agree to be bound by these terms.
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
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                                        {section.title}
                                    </h2>
                                </div>

                                <div className="space-y-4 pl-0 md:pl-16">
                                    {section.content.map((paragraph, pIndex) => (
                                        <p
                                            key={pIndex}
                                            className="text-base md:text-lg text-gray-700 leading-relaxed"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl shadow-lg p-8 md:p-10 border-2 border-primary-100"
                >
                    <h3 className="text-2xl font-black text-gray-900 mb-4">Important Note</h3>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                        These Terms and Conditions constitute a legally binding agreement between you and QuietSummit. By using our services, you acknowledge that you have read and understood these terms in their entirety.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        If you have any questions or concerns about these terms, please don't hesitate to contact us before making a booking.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
