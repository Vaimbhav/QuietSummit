import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  isAuthenticated: boolean
  email: string | null
  name: string | null
  preferences: {
    newsletter: boolean
    notifications: boolean
  }
}

const initialState: UserState = {
  isAuthenticated: false,
  email: null,
  name: null,
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
      action: PayloadAction<{ email: string; name: string; isAuthenticated: boolean }>
    ) => {
      state.email = action.payload.email
      state.name = action.payload.name
      state.isAuthenticated = action.payload.isAuthenticated
    },
    clearUser: (state) => {
      state.isAuthenticated = false
      state.email = null
      state.name = null
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
  },
})

export const { setUser, clearUser, updatePreferences } = userSlice.actions
export default userSlice.reducer
