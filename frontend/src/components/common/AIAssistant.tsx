import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
    toggleChat,
    addMessage,
    updateMessage,
    setLoading,
    clearMessages
} from '@/store/slices/chatSlice'

// Message type definition
interface Message {
    id: string
    type: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
    journeySuggestions?: JourneySuggestion[]
}

interface JourneySuggestion {
    _id: string
    title: string
    destination: string
    duration: string
    price: number
    highlights: string[]
}

export default function AIAssistant() {
    const dispatch = useAppDispatch()
    const { isOpen, messages, isLoading } = useAppSelector(state => state.chat)
    const [showTooltip, setShowTooltip] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Scroll to bottom function
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }

    // Auto-scroll to bottom when new messages arrive or content updates
    useEffect(() => {
        scrollToBottom()
    }, [messages.length])

    // Also scroll when message content changes (streaming)
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage.content) {
                scrollToBottom()
            }
        }
    }, [messages[messages.length - 1]?.content])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        // Scroll immediately when user sends message
        scrollToBottom()

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString()
        }

        dispatch(addMessage(userMessage))
        const messageToSend = inputValue.trim()
        setInputValue('')
        dispatch(setLoading(true))

        const assistantMessageId = (Date.now() + 1).toString()
        let messageCreated = false

        try {
            const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1'
            const response = await fetch(`${baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    history: messages.map(m => ({
                        role: m.type === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }))
                })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let streamedContent = ''

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6))

                                if (data.type === 'chunk') {
                                    streamedContent += data.content

                                    // Create message on first chunk
                                    if (!messageCreated) {
                                        dispatch(addMessage({
                                            id: assistantMessageId,
                                            type: 'assistant',
                                            content: streamedContent,
                                            timestamp: new Date().toISOString()
                                        }))
                                        messageCreated = true
                                    } else {
                                        // Update existing message
                                        dispatch(updateMessage({
                                            id: assistantMessageId,
                                            content: streamedContent
                                        }))
                                    }
                                } else if (data.type === 'complete') {
                                    // Final update with journey suggestions
                                    if (messageCreated) {
                                        dispatch(updateMessage({
                                            id: assistantMessageId,
                                            content: streamedContent,
                                            journeySuggestions: data.journeySuggestions
                                        }))
                                    }
                                } else if (data.type === 'error') {
                                    if (messageCreated) {
                                        dispatch(updateMessage({
                                            id: assistantMessageId,
                                            content: data.message || 'Sorry, I encountered an error. Please try again.'
                                        }))
                                    } else {
                                        dispatch(addMessage({
                                            id: assistantMessageId,
                                            type: 'system',
                                            content: data.message || 'Sorry, I encountered an error. Please try again.',
                                            timestamp: new Date().toISOString()
                                        }))
                                    }
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
            }

            dispatch(setLoading(false))
        } catch (error) {
            console.error('Chat error:', error)
            if (messageCreated) {
                dispatch(updateMessage({
                    id: assistantMessageId,
                    content: 'Sorry, I encountered an error. Please try again.'
                }))
            } else {
                dispatch(addMessage({
                    id: assistantMessageId,
                    type: 'system',
                    content: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date().toISOString()
                }))
            }
            dispatch(setLoading(false))
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleNewChat = () => {
        dispatch(clearMessages())
    }

    // Handle browser back button on mobile to close modal
    useEffect(() => {
        const handlePopState = () => {
            if (isOpen && window.innerWidth < 768) {
                dispatch(toggleChat())
            }
        }

        if (isOpen) {
            // Add state to history when modal opens
            window.history.pushState({ modalOpen: true }, '')
            window.addEventListener('popstate', handlePopState)
        }

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [isOpen, dispatch])

    return (
        <>
            {/* Floating Chat Icon */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <div className="relative">
                    {/* Tooltip */}
                    <AnimatePresence>
                        {showTooltip && !isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap"
                            >
                                Hi, I'm your personal assistant 👋 Need any help?
                                <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Chat Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => dispatch(toggleChat())}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-2xl flex items-center justify-center hover:shadow-3xl transition-shadow duration-300"
                    >
                        {isOpen ? (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <img src="/images/assistant-logo.avif" alt="Assistant" className="w-full h-full rounded-full object-cover border-2 border-white" />
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Desktop Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => dispatch(toggleChat())}
                            className="hidden md:block fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
                            style={{ maxHeight: 'calc(100vh - 140px)' }}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src="/images/assistant-logo.avif" alt="Assistant" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
                                    <div>
                                        <h3 className="font-semibold text-lg">QuietSummit Assistant</h3>
                                        <p className="text-xs text-white/80">Always here to help</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNewChat}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    title="New Chat"
                                    aria-label="Start new chat"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 overscroll-contain"
                            >
                                {messages.map((message) => (
                                    <div key={message.id}>
                                        <MessageBubble message={message} />
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-0" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-150" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-300" />
                                        </div>
                                        <span>Thinking...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t bg-white">
                                <div className="flex gap-2 items-center">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me anything..."
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="p-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow flex items-center justify-center min-w-[44px]"
                                    >
                                        <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Responsive Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop Blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => dispatch(toggleChat())}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        />

                        {/* Mobile Chat Panel - Full Screen */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed inset-0 bg-white z-50 flex flex-col md:hidden shadow-2xl"
                        >
                            {/* Mobile Header */}
                            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src="/images/assistant-logo.avif" alt="Assistant" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
                                    <div>
                                        <h3 className="font-semibold text-lg">QuietSummit Assistant</h3>
                                        <p className="text-xs text-white/80">Always here to help</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleNewChat}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        title="New Chat"
                                        aria-label="Start new chat"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => dispatch(toggleChat())}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        aria-label="Close chat"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((message) => (
                                    <div key={message.id}>
                                        <MessageBubble message={message} />
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-0" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-150" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-300" />
                                        </div>
                                        <span>Thinking...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Mobile Input Area */}
                            <div className="p-4 border-t bg-white">
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me anything..."
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="p-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
                                    >
                                        <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
    const isUser = message.type === 'user'
    const isSystem = message.type === 'system'

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
                <div
                    className={`rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                        : isSystem
                            ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                            : 'bg-white text-gray-800 shadow-md'
                        }`}
                >
                    {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded-lg prose-strong:font-semibold prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Journey Suggestions */}
                {message.journeySuggestions && message.journeySuggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {message.journeySuggestions.map((journey) => (
                            <JourneySuggestionCard key={journey._id} journey={journey} />
                        ))}
                    </div>
                )}

                <p className="text-xs text-gray-400 mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    )
}

// Journey Suggestion Card Component
function JourneySuggestionCard({ journey }: { journey: JourneySuggestion }) {
    const handleViewJourney = () => {
        // Use _id or title to navigate since slug is not in the interface
        window.location.href = `/journeys/${journey._id}`
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 cursor-pointer"
            onClick={handleViewJourney}
        >
            <h4 className="font-semibold text-gray-900 mb-1">{journey.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{journey.destination}</p>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{journey.duration}</span>
                <span className="text-sm font-bold text-blue-600">₹{journey.price.toLocaleString()}</span>
            </div>
            {journey.highlights && journey.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {journey.highlights.slice(0, 3).map((highlight, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {highlight}
                        </span>
                    ))}
                </div>
            )}
            <button className="w-full mt-2 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-shadow">
                View Details →
            </button>
        </motion.div>
    )
}
