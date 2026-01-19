import { Router } from 'express'
import {
    createBooking,
    getBookingById,
    getMemberBookings,
    cancelBooking,
    calculatePrice,
    updateBookingStatus,
} from '../controllers/bookingController'
import { authenticateToken } from '../middleware/auth'
import { validateRequest } from '../middleware/validate'
import { createBookingSchema, calculatePriceSchema } from '../validators/schemas'

const router = Router()

// Booking routes
router.post('/', authenticateToken, validateRequest(createBookingSchema), createBooking)
router.get('/member/all', authenticateToken, getMemberBookings)
router.get('/:id', authenticateToken, getBookingById)
router.patch('/:id/status', authenticateToken, updateBookingStatus)
router.put('/:id/cancel', authenticateToken, cancelBooking)
router.post('/calculate-price', validateRequest(calculatePriceSchema), calculatePrice)

export default router
