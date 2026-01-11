import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
    isAuthenticated: boolean
    email: string | null
    name: string | null
    token: string | null
    tokenExpiry: number | null
    preferences: {
        newsletter: boolean
        notifications: boolean
    }
}

const initialState: UserState = {
    isAuthenticated: false,
    email: null,
    name: null,
    token: null,
    tokenExpiry: null,
    preferences: {
        newsletter: false,
        notifications: false,
    },
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{
                email: string
                name: string
                token: string
                isAuthenticated: boolean
            }>
        ) => {
            state.email = action.payload.email
            state.name = action.payload.name
            state.token = action.payload.token
            state.isAuthenticated = action.payload.isAuthenticated

            // Decode JWT to get expiry (simple decode, not verification)
            try {
                const tokenParts = action.payload.token.split('.')
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]))
                    state.tokenExpiry = payload.exp * 1000 // Convert to milliseconds
                }
            } catch (error) {
                console.error('Error decoding token:', error)
            }
        },
        clearUser: (state) => {
            state.isAuthenticated = false
            state.email = null
            state.name = null
            state.token = null
            state.tokenExpiry = null
        },
        updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
            state.preferences = { ...state.preferences, ...action.payload }
        },
    },
})

export const { setUser, clearUser, updatePreferences } = userSlice.actions
export default userSlice.reducer
