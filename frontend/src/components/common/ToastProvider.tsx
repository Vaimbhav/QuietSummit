import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Toast, { ToastType } from './Toast'

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void
    showSuccess: (message: string) => void
    showError: (message: string) => void
    showInfo: (message: string) => void
    showWarning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

interface ToastState {
    message: string
    type: ToastType
    duration: number
    isVisible: boolean
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        type: 'info',
        duration: 5000,
        isVisible: false
    })

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
        setToast({
            message,
            type,
            duration,
            isVisible: true
        })
    }, [])

    const showSuccess = useCallback((message: string) => {
        showToast(message, 'success', 4000)
    }, [showToast])

    const showError = useCallback((message: string) => {
        showToast(message, 'error', 6000)
    }, [showToast])

    const showInfo = useCallback((message: string) => {
        showToast(message, 'info', 4000)
    }, [showToast])

    const showWarning = useCallback((message: string) => {
        showToast(message, 'warning', 5000)
    }, [showToast])

    const handleClose = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }))
    }, [])

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <Toast
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                isVisible={toast.isVisible}
                onClose={handleClose}
            />
        </ToastContext.Provider>
    )
}
