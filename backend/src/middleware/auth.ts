import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment'
import logger from '../utils/logger'

export interface JwtPayload {
    id: string
    email: string
    role?: string
    iat: number
    exp: number
}

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches decoded user data to req.user if valid
 */
export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token required',
            })
            return
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload

        // Attach user to request
        req.user = decoded
        next()
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            logger.warn('Expired token attempt')
            res.status(401).json({
                success: false,
                error: 'Token expired',
                expired: true,
            })
            return
        }

        if (error.name === 'JsonWebTokenError') {
            logger.warn('Invalid token attempt')
            res.status(401).json({
                success: false,
                error: 'Invalid token',
            })
            return
        }

        logger.error('Token verification error:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to authenticate',
        })
    }
}

/**
 * Optional authentication middleware
 * Doesn't fail if token is missing, but validates if present
 */
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]

        if (token) {
            const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload
            req.user = decoded
        }

        next()
    } catch (error) {
        // Don't fail, just continue without user
        next()
    }
}
