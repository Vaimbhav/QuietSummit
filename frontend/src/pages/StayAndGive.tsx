import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Send, User, Briefcase, Calendar, Home } from 'lucide-react'
import SEO from '@components/common/SEO'

export default function StayAndGivePage() {
    const [formData, setFormData] = useState({
        // Personal Info
        motivationLetter: '',
        skills: [] as string[],
        projectProposal: '',
        previousExperience: '',

        // References
        references: [
            { name: '', email: '', relationship: '' },
            { name: '', email: '', relationship: '' },
        ],

        // Availability
        startDate: '',
        endDate: '',
        flexible: false,
        hoursPerWeek: 20,
        daysPerWeek: 5,

        // Community Impact
        focusAreas: [] as string[],
        expectedOutcomes: '',
        sustainabilityPlan: '',

        // Accommodation
        roomType: 'Flexible',

        // Emergency Contact
        emergencyName: '',
        emergencyPhone: '',
        emergencyEmail: '',
        emergencyRelationship: '',
    })

    const [currentStep, setCurrentStep] = useState(1)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const skills = [
        'Teaching',
        'Technology/IT',
        'Agriculture',
        'Healthcare',
        'Marketing',
        'Design',
        'Writing',
        'Photography',
        'Videography',
        'Social Media',
        'Construction',
        'Cooking',
        'Language Teaching',
        'Music',
        'Art',
        'Carpentry',
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitStatus('loading')

        try {
            // Validate required fields
            if (formData.motivationLetter.length < 200) {
                alert('Please write at least 200 characters for your motivation letter')
                setSubmitStatus('idle')
                return
            }
            if (formData.skills.length === 0) {
                alert('Please select at least one skill')
                setSubmitStatus('idle')
                return
            }

            // Submit to backend API
            const response = await fetch('/api/stay-and-give/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to submit application')
            }

            setSubmitStatus('success')
            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error) {
            console.error('Application submission error:', error)
            alert('Failed to submit application. Please try again.')
            setSubmitStatus('error')
        }
    }

    const steps = [
        { number: 1, title: 'Your Story', icon: User },
        { number: 2, title: 'Experience & Skills', icon: Briefcase },
        { number: 3, title: 'Impact Plan', icon: Heart },
        { number: 4, title: 'Logistics', icon: Calendar },
    ]

    return (
        <>
            <SEO
                title="Stay & Give - Long-Term Impact Residency | QuietSummit"
                description="Apply for our long-term residency program where you contribute your skills to mountain communities while experiencing deep immersion in local life."
            />

            <div className="min-h-screen bg-[#0a0e27] text-white">
                {/* Hero Section */}
                <section
                    className="relative py-12 md:py-16 lg:py-20 text-white overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d2e 100%)'
                    }}
                >
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat" />
                    </div>

                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="inline-block mb-5 md:mb-6"
                            >
                                <Heart className="w-12 h-12 md:w-16 md:h-16 mx-auto" fill="currentColor" />
                            </motion.div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 md:mb-6">
                                Stay & Give
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed mb-6 md:mb-8">
                                Live in the mountains. Contribute your skills. Create lasting impact.
                            </p>
                            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Home className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base md:text-lg">Long-Term Stay</h3>
                                        <p className="text-white/80 text-xs md:text-sm">30-90 day residency</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base md:text-lg">Skills Exchange</h3>
                                        <p className="text-white/80 text-xs md:text-sm">5-20 hours/week</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Heart className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base md:text-lg">Community Impact</h3>
                                        <p className="text-white/80 text-xs md:text-sm">Meaningful contribution</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Application Form */}
                <section className="py-10 md:py-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                        {submitStatus === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-dark-card rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-2xl text-center border border-dark-border"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0a0e27]/60 border border-[#5ce1e6]/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
                                    <Heart className="w-8 h-8 md:w-10 md:h-10 text-[#5CE1E6]" fill="currentColor" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 md:mb-4">
                                    Application Submitted!
                                </h2>
                                <p className="text-base md:text-lg text-[#B0B7C3] mb-4 md:mb-6">
                                    Thank you for your interest in the Stay & Give program. Our team will review your application and get back to you within 7-10 business days.
                                </p>
                                <p className="text-xs md:text-sm text-[#B0B7C3]">
                                    Please check your email for a confirmation and next steps.
                                </p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Progress Steps */}
                                <div className="mb-8 md:mb-12 overflow-x-auto">
                                    <div className="flex justify-between items-center max-w-3xl mx-auto min-w-[600px] px-2">
                                        {steps.map((step, index) => {
                                            const Icon = step.icon
                                            const isActive = currentStep >= step.number
                                            const isPast = currentStep > step.number

                                            return (
                                                <div key={step.number} className="flex items-center flex-1">
                                                    <div className="flex flex-col items-center relative flex-1">
                                                        <div
                                                            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all"
                                                            style={{
                                                                background: isActive ? '#2D4F1E' : '#e5e5e5',
                                                                color: isActive ? '#ffffff' : '#737373'
                                                            }}
                                                        >
                                                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                                        </div>
                                                        <span
                                                            className="text-xs md:text-sm mt-2 font-medium text-center"
                                                            style={{ color: isActive ? '#2D4F1E' : '#737373' }}
                                                        >
                                                            {step.title}
                                                        </span>
                                                    </div>
                                                    {index < steps.length - 1 && (
                                                        <div
                                                            className="h-1 flex-1 transition-all"
                                                            style={{ background: isPast ? '#2D4F1E' : '#e5e5e5' }}
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="bg-[#1e2139] rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 shadow-2xl border border-[#5ce1e6]/15">
                                    <div className="text-center mb-8 md:mb-12">
                                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 md:mb-4">
                                            Application Form
                                        </h2>
                                        <p className="text-sm md:text-base text-[#B0B7C3]">
                                            This is not a booking—it's an application. We carefully review each submission to ensure the best fit for both you and our partner communities.
                                        </p>
                                    </div>

                                    {/* Step 1: Your Story */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-white mb-2">
                                                    Why do you want to join Stay & Give? *
                                                </label>
                                                <textarea
                                                    required
                                                    rows={6}
                                                    value={formData.motivationLetter}
                                                    onChange={(e) => setFormData({ ...formData, motivationLetter: e.target.value })}
                                                    placeholder="Share your motivation, what you hope to learn, and what draws you to this experience..."
                                                    className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none resize-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                    minLength={200}
                                                    maxLength={2000}
                                                />
                                                <span className="text-xs text-[#B0B7C3]">
                                                    {formData.motivationLetter.length}/2000 characters (minimum 200)
                                                </span>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-white mb-2">
                                                    Select Your Skills *
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {skills.map((skill) => (
                                                        <label
                                                            key={skill}
                                                            className="flex items-center gap-2 p-3 border border-[#5ce1e6]/20 rounded-xl cursor-pointer hover:border-[#5CE1E6]/50 transition-all"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.skills.includes(skill)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormData({ ...formData, skills: [...formData.skills, skill] })
                                                                    } else {
                                                                        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })
                                                                    }
                                                                }}
                                                                className="w-4 h-4 text-pine focus:ring-pine"
                                                            />
                                                            <span className="text-sm text-[#B0B7C3]">{skill}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Experience & Skills */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-white mb-2">
                                                    Project Proposal *
                                                </label>
                                                <textarea
                                                    required
                                                    rows={5}
                                                    value={formData.projectProposal}
                                                    onChange={(e) => setFormData({ ...formData, projectProposal: e.target.value })}
                                                    placeholder="Describe the project or contribution you'd like to work on during your stay..."
                                                    className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none resize-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                    minLength={100}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-white mb-2">
                                                    Previous Experience
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    value={formData.previousExperience}
                                                    onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                                                    placeholder="Share any relevant experience with similar programs, community work, or remote stays..."
                                                    className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none resize-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-white mb-3">
                                                    References
                                                </label>
                                                {formData.references.map((ref, index) => (
                                                    <div key={index} className="mb-4 p-4 border border-[#5ce1e6]/20 rounded-xl bg-[#0a0e27]/40">
                                                        <h4 className="font-semibold text-sm mb-3">Reference {index + 1}</h4>
                                                        <div className="space-y-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Name"
                                                                value={ref.name}
                                                                onChange={(e) => {
                                                                    const newRefs = [...formData.references]
                                                                    newRefs[index].name = e.target.value
                                                                    setFormData({ ...formData, references: newRefs })
                                                                }}
                                                                className="w-full px-4 py-2 border border-[#5ce1e6]/20 rounded-lg focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 outline-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                            />
                                                            <input
                                                                type="email"
                                                                placeholder="Email"
                                                                value={ref.email}
                                                                onChange={(e) => {
                                                                    const newRefs = [...formData.references]
                                                                    newRefs[index].email = e.target.value
                                                                    setFormData({ ...formData, references: newRefs })
                                                                }}
                                                                className="w-full px-4 py-2 border border-[#5ce1e6]/20 rounded-lg focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 outline-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Relationship (e.g., Former Employer, Professor)"
                                                                value={ref.relationship}
                                                                onChange={(e) => {
                                                                    const newRefs = [...formData.references]
                                                                    newRefs[index].relationship = e.target.value
                                                                    setFormData({ ...formData, references: newRefs })
                                                                }}
                                                                className="w-full px-4 py-2 border border-[#5ce1e6]/20 rounded-lg focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 outline-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Impact Plan */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-white mb-2">
                                                    Focus Areas *
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['Education', 'Environment', 'Health', 'Arts & Culture', 'Technology', 'Community Development'].map((area) => (
                                                        <label
                                                            key={area}
                                                            className="flex items-center gap-2 p-3 border border-[#5ce1e6]/20 rounded-xl cursor-pointer hover:border-[#5CE1E6]/50 transition-all"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.focusAreas.includes(area)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormData({ ...formData, focusAreas: [...formData.focusAreas, area] })
                                                                    } else {
                                                                        setFormData({ ...formData, focusAreas: formData.focusAreas.filter(a => a !== area) })
                                                                    }
                                                                }}
                                                                className="w-4 h-4 text-pine focus:ring-pine"
                                                            />
                                                            <span className="text-sm text-[#B0B7C3]">{area}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-white mb-2">
                                                    Expected Outcomes *
                                                </label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    value={formData.expectedOutcomes}
                                                    onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
                                                    placeholder="What impact do you hope to create? What outcomes do you expect from your contribution?"
                                                    className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none resize-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-white mb-2">
                                                    Sustainability Plan
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    value={formData.sustainabilityPlan}
                                                    onChange={(e) => setFormData({ ...formData, sustainabilityPlan: e.target.value })}
                                                    placeholder="How will your contribution continue to benefit the community after you leave?"
                                                    className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none resize-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Logistics */}
                                    {currentStep === 4 && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-white mb-2">
                                                        Start Date *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={formData.startDate}
                                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                        className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none bg-[#0a0e27]/60 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-white mb-2">
                                                        End Date *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={formData.endDate}
                                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                        className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none bg-[#0a0e27]/60 text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="flexible"
                                                    checked={formData.flexible}
                                                    onChange={(e) => setFormData({ ...formData, flexible: e.target.checked })}
                                                    className="w-4 h-4 text-pine focus:ring-pine rounded"
                                                />
                                                <label htmlFor="flexible" className="text-sm text-[#B0B7C3]">
                                                    My dates are flexible
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-white mb-2">
                                                        Hours Per Week *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="5"
                                                        max="40"
                                                        value={formData.hoursPerWeek}
                                                        onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
                                                        className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none bg-[#0a0e27]/60 text-white"
                                                    />
                                                    <span className="text-xs text-[#B0B7C3]">Typically 5-20 hours</span>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-white mb-2">
                                                        Days Per Week *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        max="7"
                                                        value={formData.daysPerWeek}
                                                        onChange={(e) => setFormData({ ...formData, daysPerWeek: parseInt(e.target.value) })}
                                                        className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none bg-[#0a0e27]/60 text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-white mb-2">
                                                    Room Type Preference
                                                </label>
                                                <select
                                                    value={formData.roomType}
                                                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                                                    className="w-full px-4 py-3 pr-12 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none appearance-none cursor-pointer font-medium shadow-sm bg-[#0a0e27]/60 text-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCw2TDgsMTBMMTIsNiIgc3Ryb2tlPSIjNUNFMUU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_1rem] bg-no-repeat"
                                                >
                                                    <option value="Flexible">Flexible</option>
                                                    <option value="Private">Private Room</option>
                                                    <option value="Shared">Shared Room</option>
                                                    <option value="Dorm">Dormitory</option>
                                                </select>
                                            </div>

                                            <div className="border-t border-[#5ce1e6]/15 pt-6 mt-6">
                                                <h3 className="text-lg font-bold text-white mb-4">Emergency Contact</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-bold text-white mb-2">
                                                            Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.emergencyName}
                                                            onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                                            className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none bg-[#0a0e27]/60 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-white mb-2">
                                                            Phone *
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={formData.emergencyPhone}
                                                            onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                                            className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none bg-[#0a0e27]/60 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-white mb-2">
                                                            Email *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            required
                                                            value={formData.emergencyEmail}
                                                            onChange={(e) => setFormData({ ...formData, emergencyEmail: e.target.value })}
                                                            className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none bg-[#0a0e27]/60 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-white mb-2">
                                                            Relationship *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="e.g., Parent, Spouse, Sibling"
                                                            value={formData.emergencyRelationship}
                                                            onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                                                            className="w-full px-4 py-3 border border-[#5ce1e6]/20 rounded-xl focus:ring-2 focus:ring-[#5CE1E6]/40 focus:border-[#5CE1E6]/50 transition-all outline-none bg-[#0a0e27]/60 text-white placeholder-[#B0B7C3]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#5ce1e6]/15">
                                        {currentStep > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(currentStep - 1)}
                                                className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 border rounded-xl font-semibold transition-all hover:bg-[#0a0e27]/60 active:scale-95 text-sm md:text-base"
                                                style={{ borderColor: 'rgba(92,225,230,0.3)', color: '#B0B7C3' }}
                                            >
                                                Previous
                                            </button>
                                        )}
                                        {currentStep < 4 ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(currentStep + 1)}
                                                className="w-full sm:w-auto sm:ml-auto px-8 md:px-10 py-3.5 md:py-4 font-bold rounded-xl transition-all hover:shadow-lg active:scale-95 text-sm md:text-base"
                                                style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}
                                            >
                                                Next Step
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={submitStatus === 'loading'}
                                                className="w-full sm:w-auto sm:ml-auto px-8 md:px-10 py-3.5 md:py-4 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 text-sm md:text-base"
                                                style={{ background: 'linear-gradient(135deg, #5CE1E6 0%, #4A90E2 100%)', color: '#0a0e27' }}
                                            >
                                                {submitStatus === 'loading' ? (
                                                    <>
                                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5" />
                                                        Submit Application
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </>
    )
}
