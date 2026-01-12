import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

export interface ApiError extends Error {
    statusCode?: number
}

export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    // Log full error details on server
    logger.error(`Error ${statusCode}: ${message}`)
    if (err.stack) {
        logger.error(err.stack)
    }

    // In production, send generic messages for 500 errors to avoid leaking internals
    const isProduction = process.env.NODE_ENV === 'production'
    const clientMessage = isProduction && statusCode === 500
        ? 'An internal server error occurred. Please try again later.'
        : message

    res.status(statusCode).json({
        success: false,
        error: {
            message: clientMessage,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    })
}

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
    const error: ApiError = new Error(`Not Found - ${req.originalUrl}`)
    error.statusCode = 404
    next(error)
}
