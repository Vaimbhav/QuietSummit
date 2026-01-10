import { Router } from 'express'
import {
    createBooking,
    getBookingById,
    getMemberBookings,
    cancelBooking,
    calculatePrice,
} from '../controllers/bookingController'

const router = Router()

// Booking routes
router.post('/', createBooking)
router.get('/:id', getBookingById)
router.get('/member/all', getMemberBookings)
router.put('/:id/cancel', cancelBooking)
router.post('/calculate-price', calculatePrice)

export default router
