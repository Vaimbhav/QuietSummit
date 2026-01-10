import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BudgetEstimate {
  baseCost: number
  buffer: number
  margin: number
  total: number
}

interface PlannerState {
  messages: Message[]
  currentItinerary: string | null
  budgetEstimate: BudgetEstimate | null
  preferences: {
    location?: string
    duration?: number
    travelerType?: string
    comfortLevel?: string
  }
  isGenerating: boolean
}

const initialState: PlannerState = {
  messages: [],
  currentItinerary: null,
  budgetEstimate: null,
  preferences: {},
  isGenerating: false,
}

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<Message, 'id' | 'timestamp'>>) => {
      state.messages.push({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
      })
    },
    clearMessages: (state) => {
      state.messages = []
    },
    setItinerary: (state, action: PayloadAction<string>) => {
      state.currentItinerary = action.payload
    },
    setBudgetEstimate: (state, action: PayloadAction<BudgetEstimate>) => {
      state.budgetEstimate = action.payload
    },
    setPreferences: (state, action: PayloadAction<Partial<PlannerState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload
    },
    resetPlanner: () => initialState,
  },
})

export const {
  addMessage,
  clearMessages,
  setItinerary,
  setBudgetEstimate,
  setPreferences,
  setGenerating,
  resetPlanner,
} = plannerSlice.actions
export default plannerSlice.reducer
