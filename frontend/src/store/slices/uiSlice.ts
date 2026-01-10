import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isMenuOpen: boolean
  isModalOpen: boolean
  notification: {
    message: string
    type: 'success' | 'error' | 'info'
  } | null
  loading: {
    global: boolean
    [key: string]: boolean
  }
}

const initialState: UIState = {
  isMenuOpen: false,
  isModalOpen: false,
  notification: null,
  loading: {
    global: false,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen
    },
    setMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMenuOpen = action.payload
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload
    },
    showNotification: (
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>
    ) => {
      state.notification = action.payload
    },
    clearNotification: (state) => {
      state.notification = null
    },
    setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
  },
})

export const {
  toggleMenu,
  setMenuOpen,
  setModalOpen,
  showNotification,
  clearNotification,
  setLoading,
  setGlobalLoading,
} = uiSlice.actions
export default uiSlice.reducer
