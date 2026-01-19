import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import logger from '../utils/logger'

/**
 * Middleware to validate request body against a Zod schema
 * Returns detailed field-level validation errors
 */
export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate and parse the request body
            const validated = await schema.parseAsync(req.body)

            // Replace request body with validated data (with defaults applied)
            req.body = validated

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod errors into user-friendly structure
                const fieldErrors: Record<string, string> = {}

                error.issues.forEach((err) => {
                    const path = err.path.join('.')
                    fieldErrors[path] = err.message
                })

                logger.warn('Validation error:', { errors: fieldErrors, path: req.path })

                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    fields: fieldErrors,
                    details: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                        code: err.code,
                    })),
                })
                return
            }

            // Unexpected error
            logger.error('Unexpected validation error:', error)
            res.status(500).json({
                success: false,
                error: 'Internal server error during validation',
            })
        }
    }
}

/**
 * Middleware to validate query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.query)
            req.query = validated as any
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const fieldErrors: Record<string, string> = {}
                error.issues.forEach((err) => {
                    const path = err.path.join('.')
                    fieldErrors[path] = err.message
                })

                res.status(400).json({
                    success: false,
                    error: 'Query validation failed',
                    fields: fieldErrors,
                })
                return
            }

            logger.error('Unexpected query validation error:', error)
            res.status(500).json({
                success: false,
                error: 'Internal server error during validation',
            })
        }
    }
}

/**
 * Middleware to validate route parameters
 */
export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.params)
            req.params = validated as any
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const fieldErrors: Record<string, string> = {}
                error.issues.forEach((err) => {
                    const path = err.path.join('.')
                    fieldErrors[path] = err.message
                })

                res.status(400).json({
                    success: false,
                    error: 'Parameter validation failed',
                    fields: fieldErrors,
                })
                return
            }

            logger.error('Unexpected param validation error:', error)
            res.status(500).json({
                success: false,
                error: 'Internal server error during validation',
            })
        }
    }
}
