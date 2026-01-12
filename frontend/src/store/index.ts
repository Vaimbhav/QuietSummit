import { configureStore } from '@reduxjs/toolkit'
import journeyReducer from './slices/journeySlice'
import userReducer from './slices/userSlice'
import uiReducer from './slices/uiSlice'
import chatReducer from './slices/chatSlice'

export const store = configureStore({
    reducer: {
        journey: journeyReducer,
        user: userReducer,
        ui: uiReducer,
        chat: chatReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
