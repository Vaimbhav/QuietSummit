import express from 'express'
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
} from '../controllers/notificationController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

router.get('/', getUserNotifications)
router.get('/unread-count', getUnreadCount)
router.patch('/:notificationId/read', markAsRead)
router.patch('/mark-all-read', markAllAsRead)
router.delete('/:notificationId', deleteNotification)
router.delete('/read/all', deleteAllRead)

export default router
