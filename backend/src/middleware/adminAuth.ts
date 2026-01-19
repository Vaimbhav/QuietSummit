import { Request, Response, NextFunction } from 'express'
import SignUp from '../models/SignUp'
import logger from '../utils/logger'

// Helper function to get user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any
    return user?.id || user?._id?.toString()
}

/**
 * Middleware to check if user has admin role
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            })
            return
        }

        // Fetch user from database to check role
        const user = await SignUp.findById(userId).select('role')

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        if (user.role !== 'admin') {
            logger.warn(`Unauthorized admin access attempt by user ${userId}`)
            res.status(403).json({
                success: false,
                error: 'Admin access required',
            })
            return
        }

        next()
    } catch (error) {
        logger.error('Admin authorization error:', error)
        res.status(500).json({
            success: false,
            error: 'Authorization failed',
        })
    }
}
