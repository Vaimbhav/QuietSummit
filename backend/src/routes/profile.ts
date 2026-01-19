import express from 'express'
import {
    getMyProfile,
    updateMyProfile,
    changePassword,
    updateEmail,
    deleteAccount,
    getMyBookings,
    getMyProperties,
    getMyReviews,
    getReviewsAboutMe,
    getMyStats,
} from '../controllers/profileController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Profile management
router.get('/', getMyProfile)
router.put('/', updateMyProfile)
router.patch('/password', changePassword)
router.patch('/email', updateEmail)
router.delete('/', deleteAccount)

// User data
router.get('/bookings', getMyBookings)
router.get('/properties', getMyProperties)
router.get('/reviews', getMyReviews)
router.get('/reviews-received', getReviewsAboutMe)
router.get('/stats', getMyStats)

export default router
