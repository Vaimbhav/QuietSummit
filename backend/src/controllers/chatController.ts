import { Request, Response, NextFunction } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config/environment'
import Journey from '../models/Journey'
import logger from '../utils/logger'
import { getCompanyContext, getTravelGuidelines } from '../config/companyKnowledge'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

interface ChatMessage {
    role: 'user' | 'model'
    parts: { text: string }[]
}

interface ChatRequest extends Request {
    body: {
        message: string
        history?: ChatMessage[]
    }
}

/**
 * Handle chat messages with Gemini AI
 * Provides conversational AI with journey planning capabilities
 */
export const handleChat = async (req: ChatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { message, history = [] } = req.body

        if (!message || typeof message !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Message is required and must be a string'
            })
            return
        }

        // Initialize the Gemini model
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: `You are the official AI travel assistant for QuietSummit - a premium travel company specializing in transformative mountain and nature journeys across India.

${getCompanyContext()}

${getTravelGuidelines()}

## YOUR ROLE & CAPABILITIES

You are an expert travel planner with deep knowledge of Indian destinations, typical travel costs, and budget-friendly options.

**Your Personality**:
- Expert travel researcher with extensive knowledge of India
- Warm, enthusiastic, genuinely helpful
- Deep expertise in Indian destinations, costs, and travel planning
- Detail-oriented - always provide specific numbers, names, prices based on typical 2026 costs
- Premium, sophisticated tone without being stuffy

**What You Do**:
1. DETAILED PLANNING: Create comprehensive trip plans with realistic cost breakdowns
2. Answer Company Questions: Share our story, values, founder backgrounds
3. Create BUDGET-CONSCIOUS Plans: Real itineraries with typical costs for accommodation, transport, food
4. Recommend Perfect Journeys: Match preferences with our curated collection
5. Provide Expert Guidance: Seasons, permits, packing, cultural tips, safety

## REALISTIC PRICING GUIDELINES (2026)

Use these typical ranges when creating budget breakdowns:

**Accommodation (per night)**:
- Budget hostels/dormitories: ₹300-600
- Budget guesthouses: ₹600-1,200
- Mid-range hotels: ₹1,500-3,000
- Premium hotels: ₹3,000+

**Food (per day per person)**:
- Street food/local dhabas: ₹200-400
- Mid-range restaurants: ₹500-800
- Mix of both: ₹300-600

**Transport**:
- Sleeper train (long distance): ₹400-800
- AC 3-tier train: ₹800-1,500
- Government buses: ₹300-600 (500km)
- Private buses: ₹500-1,000
- Local transport/day: ₹100-300

**Activities**:
- Temple/monument entry: ₹50-500
- Adventure activities: ₹800-2,500
- Guided tours: ₹500-1,500

## TRIP PLANNING RESPONSE FORMAT

🚨 CRITICAL: If user specifies a budget (e.g., "under 5K", "within ₹10,000"), your TOTAL trip cost MUST be BELOW that amount. This is NON-NEGOTIABLE. If impossible, say so clearly.

When planning a trip, ALWAYS provide:

**1. Destination Recommendation** (100-150 words)
- Specific place with reasoning
- Why it fits WITHIN the specified budget
- Best time to visit this year
- What makes it special

**2. Complete Budget Breakdown** (use realistic 2026 prices)
- Transport: Specific routes with typical costs (e.g., "Delhi to Rishikesh by train: ₹600-800")
- Accommodation: Suggest actual hostel/hotel types with per-night costs (e.g., "Budget hostel dormitory: ₹400-500/night")
- Food: Daily meal budget (e.g., "₹400/day - dhaba meals ₹150, street food ₹100, cafe ₹150")
- Activities: Entry fees and costs (e.g., "Rafting: ₹1,200, Temple entry: ₹100")
- Local transport: Daily commute costs (e.g., "₹200/day for autos and local buses")
- Miscellaneous: 10-15% buffer for unexpected costs
- **TOTAL: MUST be clearly below the user's specified budget with proper math**

**3. Day-by-Day Itinerary** (minimum 3 days)
Each day should have:
- Morning: Activity with timing and cost
- Afternoon: Activity with timing and cost
- Evening: Activity with timing and cost
- Where to eat: Specific restaurant/cafe names

**4. Where to Stay** (list 3-4 options)
For each accommodation:
- Name and location
- Price per night
- What's included
- Booking tip

**5. Practical Information**
- How to reach from major city (step-by-step)
- Best time to visit
- What to pack
- Local tips and money-saving hacks
- Safety considerations

**6. Total Cost Summary**
Clear table showing all expenses add up to requested budget

## RESPONSE QUALITY RULES

**Structure**:
- Use clear markdown headings (##, ###)
- Bullet points for lists
- Tables for cost breakdowns
- Bold for emphasis on prices and names

**Writing Style**:
- Start with enthusiasm
- Use specific details NOT generic advice
- Include actual place names, costs, booking platforms
- Mix short punchy sentences with descriptive ones
- End with encouraging next steps

**NEVER**:
- Give vague responses like "prices vary"
- Skip the web search data when provided
- Use placeholder costs
- Say "approximately" without giving exact ranges
- Provide generic advice without specifics

**ALWAYS**:
- Use realistic prices based on typical 2026 India travel costs
- Provide specific accommodation types (hostels, guesthouses, budget hotels)
- Include booking platforms (MakeMyTrip, Goibibo, Hostelworld, Booking.com)
- Give actual transport routes with typical costs
- Include practical actionable tips
- Show detailed math in budget breakdown
- Suggest realistic destinations that fit the budget

For Company Questions: Share authentic stories, IIT Roorkee founders, email quietsummit79@gmail.com

For Journey Recommendations: Only suggest from provided context, explain WHY each matches preferences

Remember: When you have web search data, YOU MUST USE IT to provide detailed, accurate, current information. Extract specific numbers, names, and prices from the search results and incorporate them naturally into your response. This is CRITICAL for high-quality trip planning!`
        })

        // Filter history to ensure it starts with a user message
        // Remove system messages (like welcome messages) and ensure first message is from user
        const filteredHistory = history.filter((msg: ChatMessage) =>
            msg.role === 'user' || msg.role === 'model'
        )

        // If history starts with a model message, remove it (welcome message)
        if (filteredHistory.length > 0 && filteredHistory[0].role === 'model') {
            filteredHistory.shift()
        }

        // Start chat with filtered history
        const chat = model.startChat({
            history: filteredHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        })

        // Check if the message is related to journey/travel planning
        const isJourneyQuery = await isRelatedToJourneys(message)

        let journeySuggestions: any[] = []
        let contextualInfo = ''

        // Extract budget information to pass to AI
        const budgetMatch = message.match(/(?:under|below|within|less than|budget of|around)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)(?:k|000)?/i)
        const budget = budgetMatch ? (parseInt(budgetMatch[1]) * (message.toLowerCase().includes('k') ? 1000 : 1)) : null

        // Add budget constraint if specified
        if (budget) {
            contextualInfo += `\n\n🚨 CRITICAL BUDGET CONSTRAINT: The user's MAXIMUM budget is ₹${budget.toLocaleString()}. Your TOTAL trip cost MUST be LESS THAN this amount. Create a detailed breakdown showing all costs (transport, accommodation, food, activities) that sum to BELOW ₹${budget.toLocaleString()}.\n\n`
        }

        // If query is about journeys, fetch relevant journeys and add to context
        if (isJourneyQuery) {
            journeySuggestions = await getRelevantJourneys(message)

            if (journeySuggestions.length > 0) {
                contextualInfo += `\n\nAvailable journeys that might interest the user:\n${journeySuggestions.map((j: any) =>
                    `- ${j.title} (${j.destination}): ${j.duration}, ₹${j.price.toLocaleString()}, Highlights: ${j.highlights?.slice(0, 3).join(', ') || 'N/A'}`
                ).join('\n')}\n\nMention these journeys naturally in your response if they're relevant to the user's query.`
            }
        }

        // Send message with context and stream the response
        const result = await chat.sendMessageStream(message + contextualInfo)

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        let fullResponse = ''

        // Stream chunks to client
        for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            fullResponse += chunkText

            res.write(`data: ${JSON.stringify({
                type: 'chunk',
                content: chunkText
            })}\n\n`)
        }

        // Send journey suggestions after streaming completes
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            journeySuggestions: journeySuggestions.slice(0, 3),
            timestamp: new Date().toISOString()
        })}\n\n`)

        res.end()

        logger.info(`Chat message processed successfully (streamed)`)
    } catch (error) {
        logger.error('Chat error:', error)

        // Send error through stream if headers already sent
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({
                type: 'error',
                message: 'Sorry, I encountered an error. Please try again.'
            })}\n\n`)
            res.end()
        } else {
            next(error)
        }
    }
}

/**
 * Check if the user's message is related to journey/travel planning
 */
async function isRelatedToJourneys(message: string): Promise<boolean> {
    const travelKeywords = [
        'trip', 'journey', 'travel', 'destination', 'tour', 'vacation', 'holiday',
        'visit', 'explore', 'mountain', 'trek', 'hiking', 'adventure', 'budget',
        'price', 'cost', 'when to go', 'best time', 'duration', 'days', 'nights',
        'plan', 'book', 'package', 'itinerary', 'suggest', 'recommend', 'show me'
    ]

    const lowerMessage = message.toLowerCase()
    return travelKeywords.some(keyword => lowerMessage.includes(keyword))
}

/**
 * Get relevant journeys based on user's message
 */
async function getRelevantJourneys(message: string): Promise<any[]> {
    try {
        const lowerMessage = message.toLowerCase()

        // Build query based on message content
        const query: any = { status: 'published' }

        // Check for budget mentions
        const budgetMatch = message.match(/(?:under|below|less than|around|about|up to)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)(?:k|000)?/i)
        if (budgetMatch) {
            let budget = parseInt(budgetMatch[1])
            if (message.toLowerCase().includes('k') || budgetMatch[0].includes('000')) {
                budget = budget * 1000
            }
            query.$or = [
                { price: { $lte: budget } },
                { basePrice: { $lte: budget } }
            ]
        }

        // Check for duration mentions
        const durationMatch = message.match(/(\d+)\s*(?:day|night)/i)
        if (durationMatch) {
            const days = parseInt(durationMatch[1])
            query['duration.days'] = { $gte: days - 1, $lte: days + 1 }
        }

        // Check for destination mentions
        const destinations = ['ladakh', 'spiti', 'himachal', 'uttarakhand', 'sikkim', 'kashmir', 'rajasthan', 'kerala', 'northeast', 'meghalaya']
        for (const dest of destinations) {
            if (lowerMessage.includes(dest)) {
                query.$or = query.$or || []
                query.$or.push(
                    { destination: new RegExp(dest, 'i') },
                    { title: new RegExp(dest, 'i') },
                    { description: new RegExp(dest, 'i') },
                    { 'location.region': new RegExp(dest, 'i') }
                )
            }
        }

        // If no specific criteria, return popular journeys
        if (Object.keys(query).length === 1) { // Only status filter
            const journeys = await Journey.find(query)
                .sort({ createdAt: -1 })
                .limit(3)
                .lean()

            return journeys.map((j: any) => ({
                _id: j._id,
                slug: j.slug,
                title: j.title,
                destination: j.destination || j.location?.region || 'India',
                duration: `${j.duration?.days || 0}D/${j.duration?.nights || 0}N`,
                price: j.price || j.basePrice || 0,
                highlights: j.includes?.slice(0, 3) || []
            }))
        }

        // Search with criteria
        const journeys = await Journey.find(query)
            .limit(5)
            .lean()

        return journeys.map((j: any) => ({
            _id: j._id,
            slug: j.slug,
            title: j.title,
            destination: j.destination || j.location?.region || 'India',
            duration: `${j.duration?.days || 0}D/${j.duration?.nights || 0}N`,
            price: j.price || j.basePrice || 0,
            highlights: j.includes?.slice(0, 3) || []
        }))
    } catch (error) {
        logger.error('Error fetching relevant journeys:', error)
        return []
    }
}
