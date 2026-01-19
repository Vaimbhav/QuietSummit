/**
 * QuietSummit Company Knowledge Base
 * Centralized repository of company information for AI assistant
 */

export const companyKnowledge = {
    company: {
        name: 'QuietSummit',
        founded: 2018,
        tagline: 'Transformative mountain and nature journeys across India',
        mission: 'Creating journeys that honor depth over distance, connection over collection',
        contact: {
            email: 'quietsummit79@gmail.com',
            supportEmail: 'quietsummit79@gmail.com'
        }
    },

    founders: [
        {
            name: 'Nagendra Rajput',
            role: 'Founder & CEO',
            education: 'IIT Roorkee',
            focus: 'Vision to transform travel into meaningful experiences',
            passion: 'Redefining travel through intentionality'
        },
        {
            name: 'Shiv Prakash',
            role: 'Co-Founder & Operations Lead',
            education: 'IIT Roorkee',
            focus: 'Expertise in operations and logistics',
            passion: 'Excellence in execution'
        },
        {
            name: 'Mihir Chawla',
            role: 'Co-Founder & Technology Lead',
            education: 'IIT Roorkee',
            focus: 'Building meaningful digital experiences',
            passion: 'Building technology that connects people to nature'
        }
    ],

    originStory: {
        year: 2018,
        inspiration: 'Born from an epiphany during a quiet morning in the Himalayas',
        question: 'What if travel wasn\'t about seeing more, but feeling more?',
        realization: 'The most profound travel experiences came from moments of stillness, conversations with locals, watching sunrise alone on mountain trails, and the space between destinations where transformation actually happens',
        founding: 'That morning, QuietSummit was born—not as a business plan, but as a commitment to create journeys that honor depth over distance, connection over collection'
    },

    corePhilosophy: [
        {
            principle: 'Embrace Slowness',
            emoji: '🐌',
            description: 'In a world that glorifies speed, we champion the radical act of slowing down. Real transformation doesn\'t happen at 100mph',
            motto: 'Depth over distance, always'
        },
        {
            principle: 'Travel With Purpose',
            emoji: '🎯',
            description: 'Every journey has intention. Every destination tells a story. We don\'t just go places—we understand them, respect them, learn from them',
            motto: 'Meaning over miles'
        },
        {
            principle: 'Leave It Better',
            emoji: '🌱',
            description: 'We believe travel should give back more than it takes. Environmental stewardship and cultural respect aren\'t optional—they\'re essential',
            motto: 'Positive impact, guaranteed'
        }
    ],

    differentiators: [
        {
            title: 'Intentional Design',
            description: 'Every moment is purposefully crafted. We spend months researching, building relationships with local communities, and refining each journey to ensure authenticity and depth',
            highlight: 'No cookie-cutter tours'
        },
        {
            title: 'Small Group Philosophy',
            maxGroupSize: 12,
            description: 'Maximum 12 travelers per journey. This isn\'t about economics—it\'s about creating intimate experiences where real connections form and meaningful conversations happen naturally',
            highlight: 'Intimate, never crowded'
        },
        {
            title: 'Local First Approach',
            description: 'We work exclusively with local guides, family-run accommodations, and community initiatives. Your journey directly supports the places and people you visit',
            highlight: '100% locally partnered',
            impact: 'Direct community support through every booking'
        },
        {
            title: 'Sustainable by Design',
            description: 'Environmental and cultural responsibility isn\'t an add-on—it\'s woven into every decision. Carbon-conscious travel, waste reduction, and respect for local customs are non-negotiable',
            highlight: 'Carbon offset included',
            practices: ['Carbon offsetting', 'Waste reduction', 'Cultural respect', 'Leave No Trace principles']
        }
    ],

    travelApproach: {
        budgetGuidelines: {
            low: {
                range: 'Under ₹10,000',
                recommendations: [
                    'Budget destinations accessible by public transport',
                    'Hostels and budget guesthouses',
                    'Local street food and budget restaurants',
                    'Free activities like hiking, local markets, temples',
                    'Public buses and trains',
                    'Off-season travel for lower costs'
                ]
            },
            medium: {
                range: '₹10,000 - ₹50,000',
                recommendations: [
                    'Mid-range hotels and homestays',
                    'Mix of public and private transport',
                    'Combination of local and tourist restaurants',
                    'Paid attractions and guided tours',
                    'Popular destinations with good infrastructure'
                ]
            },
            high: {
                range: '₹50,000+',
                recommendations: [
                    'Premium accommodations and boutique properties',
                    'Private transport and domestic flights',
                    'Curated dining experiences',
                    'Organized tours with expert guides',
                    'Exclusive experiences and premium activities'
                ]
            }
        },
        responseGuidelines: {
            alwaysProvide: 'Helpful travel plans regardless of budget',
            neverDismiss: 'Never say "we don\'t have trips in this budget"',
            beCreative: 'Offer both QuietSummit journeys and independent travel options',
            includeDetails: 'Specific accommodations, transport, food spots, activities with price ranges',
            structure: 'Clear sections: Destination, Budget Breakdown, Day-by-Day Itinerary, Travel Tips'
        }
    },

    destinations: {
        primary: [
            'Ladakh',
            'Spiti Valley',
            'Himachal Pradesh',
            'Uttarakhand',
            'Sikkim',
            'Kashmir',
            'Northeast India',
            'Meghalaya'
        ],
        secondary: [
            'Rajasthan',
            'Kerala',
            'Western Ghats'
        ]
    }
}

/**
 * Generate formatted company context for AI
 */
export function getCompanyContext(): string {
    const { company, founders, originStory, corePhilosophy, differentiators } = companyKnowledge

    return `
## ABOUT ${company.name.toUpperCase()}

**Founded**: ${company.founded}
**Mission**: ${company.mission}
**Contact**: ${company.contact.email}

### Founders
${founders.map(f => `- **${f.name}** (${f.role}): ${f.education} alumnus. ${f.focus}. Passionate about: "${f.passion}"`).join('\n')}

### Origin Story
In ${originStory.year}, the founder had an epiphany: "${originStory.question}"
${originStory.realization}
${originStory.founding}

### Core Philosophy
${corePhilosophy.map(p => `**${p.principle}** ${p.emoji}: ${p.description}\n- Motto: ${p.motto}`).join('\n\n')}

### What Makes Us Different
${differentiators.map(d => {
        let text = `**${d.title}**: ${d.description}\n- ${d.highlight}`
        if ('maxGroupSize' in d) text += `\n- Maximum ${d.maxGroupSize} travelers per journey`
        return text
    }).join('\n\n')}
`.trim()
}

/**
 * Generate travel planning guidelines
 */
export function getTravelGuidelines(): string {
    const { budgetGuidelines, responseGuidelines } = companyKnowledge.travelApproach

    return `
## TRAVEL PLANNING APPROACH

### Budget Guidelines
**Low Budget (${budgetGuidelines.low.range})**:
${budgetGuidelines.low.recommendations.map(r => `- ${r}`).join('\n')}

**Medium Budget (${budgetGuidelines.medium.range})**:
${budgetGuidelines.medium.recommendations.map(r => `- ${r}`).join('\n')}

**High Budget (${budgetGuidelines.high.range})**:
${budgetGuidelines.high.recommendations.map(r => `- ${r}`).join('\n')}

### Response Guidelines
- ${responseGuidelines.alwaysProvide}
- ${responseGuidelines.neverDismiss}
- ${responseGuidelines.beCreative}
- Include: ${responseGuidelines.includeDetails}
- Structure: ${responseGuidelines.structure}
`.trim()
}
