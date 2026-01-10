import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Journey {
  _id: string
  title: string
  slug: string
  description: string
  location: {
    region: string
    country: string
  }
  duration: {
    days: number
    nights: number
  }
  difficulty: 'easy' | 'moderate' | 'challenging'
  basePrice: number
  images: string[]
}

interface JourneyState {
  journeys: Journey[]
  selectedJourney: Journey | null
  filters: {
    difficulty?: string
    region?: string
    duration?: number
  }
  loading: boolean
  error: string | null
}

const initialState: JourneyState = {
  journeys: [],
  selectedJourney: null,
  filters: {},
  loading: false,
  error: null,
}

const journeySlice = createSlice({
  name: 'journey',
  initialState,
  reducers: {
    setJourneys: (state, action: PayloadAction<Journey[]>) => {
      state.journeys = action.payload
    },
    setSelectedJourney: (state, action: PayloadAction<Journey | null>) => {
      state.selectedJourney = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<JourneyState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setJourneys, setSelectedJourney, setFilters, clearFilters, setLoading, setError } =
  journeySlice.actions
export default journeySlice.reducer
