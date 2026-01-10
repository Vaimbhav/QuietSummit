import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

export interface ApiError extends Error {
  statusCode?: number
}

export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  logger.error(`Error ${statusCode}: ${message}`)
  logger.error(err.stack)

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  })
}

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error: ApiError = new Error(`Not Found - ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}
