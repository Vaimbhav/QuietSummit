import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Message {
    id: string
    type: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string  // ISO string format for serialization
    journeySuggestions?: JourneySuggestion[]
}

export interface JourneySuggestion {
    _id: string
    title: string
    destination: string
    duration: string
    price: number
    highlights: string[]
}

interface ChatState {
    isOpen: boolean
    messages: Message[]
    isLoading: boolean
}

const initialState: ChatState = {
    isOpen: false,
    messages: [
        {
            id: 'welcome',
            type: 'assistant',
            content: "Hi there! 👋 I'm here to help you plan, explore, or answer anything you need.",
            timestamp: new Date().toISOString()
        }
    ],
    isLoading: false
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        toggleChat: (state) => {
            state.isOpen = !state.isOpen
        },
        openChat: (state) => {
            state.isOpen = true
        },
        closeChat: (state) => {
            state.isOpen = false
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload)
        },
        updateMessage: (state, action: PayloadAction<{ id: string; content: string; journeySuggestions?: JourneySuggestion[] }>) => {
            const message = state.messages.find(m => m.id === action.payload.id)
            if (message) {
                message.content = action.payload.content
                if (action.payload.journeySuggestions) {
                    message.journeySuggestions = action.payload.journeySuggestions
                }
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        clearMessages: (state) => {
            state.messages = [
                {
                    id: Date.now().toString(),
                    type: 'assistant',
                    content: "Hi there! 👋 I'm here to help you plan, explore, or answer anything you need.",
                    timestamp: new Date().toISOString()
                }
            ]
        }
    }
})

export const {
    toggleChat,
    openChat,
    closeChat,
    addMessage,
    updateMessage,
    setLoading,
    clearMessages
} = chatSlice.actions

export default chatSlice.reducer
