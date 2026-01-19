import { Request, Response } from 'express'
import Notification from '../models/Notification'
import logger from '../utils/logger'

// Helper function to get user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any
    return user?.id || user?._id?.toString()
}

// Create notification (internal helper function, can also be used by other controllers)
export const createNotification = async (
    userId: string,
    type: 'booking' | 'review' | 'message' | 'payment' | 'property' | 'system',
    title: string,
    message: string,
    data?: any
): Promise<void> => {
    try {
        await Notification.create({
            userId,
            type,
            title,
            message,
            data,
        })
        logger.info(`Notification created for user ${userId}: ${type}`)
    } catch (error) {
        logger.error('Error creating notification:', error)
    }
}

// Get user's notifications
export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const filter = req.query.filter as string // 'all', 'unread', 'read'

        // Build query
        const query: any = { userId }
        if (filter === 'unread') {
            query.isRead = false
        } else if (filter === 'read') {
            query.isRead = true
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v')

        const total = await Notification.countDocuments(query)
        const unreadCount = await Notification.countDocuments({ userId, isRead: false })

        res.status(200).json({
            success: true,
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching notifications:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications',
            message: (error as Error).message,
        })
        return
    }
}

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const count = await Notification.countDocuments({ userId, isRead: false })

        res.status(200).json({
            success: true,
            unreadCount: count,
        })
        return
    } catch (error) {
        logger.error('Error fetching unread count:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch unread count',
            message: (error as Error).message,
        })
        return
    }
}

// Mark notification as read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const { notificationId } = req.params

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        )

        if (!notification) {
            res.status(404).json({
                success: false,
                error: 'Notification not found',
            })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification,
        })
        return
    } catch (error) {
        logger.error('Error marking notification as read:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read',
            message: (error as Error).message,
        })
        return
    }
}

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const result = await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() }
        )

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            count: result.modifiedCount,
        })
        return
    } catch (error) {
        logger.error('Error marking all notifications as read:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to mark all notifications as read',
            message: (error as Error).message,
        })
        return
    }
}

// Delete notification
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const { notificationId } = req.params

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId,
        })

        if (!notification) {
            res.status(404).json({
                success: false,
                error: 'Notification not found',
            })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted',
        })
        return
    } catch (error) {
        logger.error('Error deleting notification:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification',
            message: (error as Error).message,
        })
        return
    }
}

// Delete all read notifications
export const deleteAllRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const result = await Notification.deleteMany({ userId, isRead: true })

        res.status(200).json({
            success: true,
            message: 'All read notifications deleted',
            count: result.deletedCount,
        })
        return
    } catch (error) {
        logger.error('Error deleting read notifications:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to delete read notifications',
            message: (error as Error).message,
        })
        return
    }
}
