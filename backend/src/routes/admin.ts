import express from 'express'
import {
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    getAllProperties,
    approveProperty,
    rejectProperty,
    getAllBookings,
    getPlatformStats,
    getReportedReviews,
    removeReview,
    dismissReviewReport,
    getAllPayouts,
    approvePayout,
    rejectPayout,
    deleteProperty,
} from '../controllers/adminController'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = express.Router()

// All routes require authentication and admin role
router.use(authenticateToken)
router.use(requireAdmin)

// User management
router.get('/users', getAllUsers)
router.patch('/users/:userId/status', updateUserStatus)
router.patch('/users/:userId/role', updateUserRole)

// Property management
router.get('/properties', getAllProperties)
router.patch('/properties/:propertyId/approve', approveProperty)
router.patch('/properties/:propertyId/reject', rejectProperty)
router.delete('/properties/:propertyId', deleteProperty)

// Booking management
router.get('/bookings', getAllBookings)

// Statistics
router.get('/stats', getPlatformStats)

// Review moderation
router.get('/reviews/reported', getReportedReviews)
router.delete('/reviews/:reviewId', removeReview)
router.patch('/reviews/:reviewId/dismiss-report', dismissReviewReport)

// Payout management
router.get('/payouts', getAllPayouts)
router.patch('/payouts/:payoutId/approve', approvePayout)
router.patch('/payouts/:payoutId/reject', rejectPayout)

export default router
