import cors from 'cors'
import { config } from '../config/environment'
import logger from '../utils/logger'

// In production, only allow configured CORS origin
// In development, also allow localhost origins for testing
const allowedOrigins = config.isProduction
    ? [config.corsOrigin].map(origin => origin.replace(/\/$/, ''))
    : [
        config.corsOrigin,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000'
    ].map(origin => origin.replace(/\/$/, '')) // Remove trailing slashes

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., curl, Postman, server-to-server, health checks)
        if (!origin) {
            return callback(null, true)
        }

        const normalizedOrigin = origin.replace(/\/$/, '')

        // In development, be more permissive with localhost origins
        if (config.isDevelopment && normalizedOrigin.includes('localhost')) {
            logger.info(`CORS: Allowing localhost origin (development): ${origin}`)
            return callback(null, true)
        }

        // Check against allowed origins
        if (allowedOrigins.includes(normalizedOrigin)) {
            logger.info(`CORS: Allowing origin: ${origin}`)
            callback(null, true)
        } else {
            logger.warn(`CORS: Blocking unauthorized origin: ${origin}`)
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
})
