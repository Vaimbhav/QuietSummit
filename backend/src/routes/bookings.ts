import { Router } from 'express'
import {
    createBooking,
    getBookingById,
    getMemberBookings,
    cancelBooking,
    calculatePrice,
} from '../controllers/bookingController'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = Router()

// Booking routes
router.post('/', optionalAuth, createBooking)
router.get('/member/all', authenticateToken, getMemberBookings)
router.get('/:id', authenticateToken, getBookingById)
router.put('/:id/cancel', authenticateToken, cancelBooking)
router.post('/calculate-price', calculatePrice)

export default router
