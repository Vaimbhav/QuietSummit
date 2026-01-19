import express from 'express'
import {
    createReview,
    getPropertyReviews,
    getHostReviews,
    replyToReview,
    reportReview,
    getMyReviews,
} from '../controllers/reviewController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/property/:propertyId', getPropertyReviews)
router.get('/host/:hostId', getHostReviews)

// Protected routes
router.post('/', authenticateToken, createReview)
router.post('/:reviewId/reply', authenticateToken, replyToReview)
router.post('/:reviewId/report', authenticateToken, reportReview)
router.get('/my/reviews', authenticateToken, getMyReviews)

export default router
