import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import logger from '../utils/logger'

// Extend Express Request type to include requestId
declare global {
    namespace Express {
        interface Request {
            requestId?: string
            startTime?: number
        }
    }
}

/**
 * Middleware to attach unique request ID to each request
 * Useful for tracing requests across logs and debugging
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
    // Check if request ID already exists in headers (from load balancer, gateway, etc.)
    const existingRequestId = req.headers['x-request-id'] as string

    // Generate new ID if not present
    const requestId = existingRequestId || uuidv4()

    // Attach to request object
    req.requestId = requestId

    // Add to response headers for client-side debugging
    res.setHeader('X-Request-ID', requestId)

    // Record start time for duration calculation
    req.startTime = Date.now()

    next()
}

/**
 * Middleware to log request details with request ID
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const { method, url, requestId, ip } = req

    logger.info('Incoming request', {
        requestId,
        method,
        url,
        ip: ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
    })

    // Log response when it finishes
    const originalSend = res.send
    res.send = function (data) {
        const duration = req.startTime ? Date.now() - req.startTime : 0

        logger.info('Request completed', {
            requestId,
            method,
            url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        })

        return originalSend.call(this, data)
    }

    next()
}

/**
 * Error handler that includes request ID in error responses
 */
export const errorWithRequestId = (err: any, req: Request, res: Response, _next: NextFunction) => {
    const { requestId } = req

    logger.error('Request error', {
        requestId,
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
    })

    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    res.status(statusCode).json({
        success: false,
        error: message,
        requestId, // Include request ID for support/debugging
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
}
