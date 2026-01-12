import { ReactNode, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoginModal from './LoginModal'

interface BookingGuardProps {
    children: (openBooking: () => void) => ReactNode
    onAuthenticated?: () => void
}

/**
 * BookingGuard - Intercepts booking attempts from non-authenticated users
 * Shows login modal instead of redirecting, providing seamless auth flow
 * Perfect for "Book Now" buttons on journey detail pages
 */
export default function BookingGuard({ children, onAuthenticated }: BookingGuardProps) {
    const { isAuthenticated } = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

    const handleBookingAttempt = () => {
        if (isAuthenticated) {
            // User is logged in, proceed with booking
            onAuthenticated?.()
        } else {
            // User not logged in, show login modal
            setShowLoginModal(true)
            // Store the action to execute after successful login
            setPendingAction(() => onAuthenticated)
        }
    }

    const handleLoginSuccess = () => {
        setShowLoginModal(false)
        // Execute pending action after successful login
        if (pendingAction) {
            // Small delay to let state update
            setTimeout(() => {
                pendingAction()
                setPendingAction(null)
            }, 100)
        }
    }

    const handleCloseModal = () => {
        setShowLoginModal(false)
        setPendingAction(null)
    }

    return (
        <>
            {children(handleBookingAttempt)}
            <LoginModal
                isOpen={showLoginModal}
                onClose={handleCloseModal}
                onSuccess={handleLoginSuccess}
            />
        </>
    )
}
