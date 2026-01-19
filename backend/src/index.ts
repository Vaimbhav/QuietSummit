import express, { Express } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import mongoose from 'mongoose'
import { config } from './config/environment'
import { connectDatabase } from './config/database'
import { corsMiddleware } from './middleware/cors'
import { errorHandler, notFound } from './middleware/errorHandler'
import { requestId, requestLogger } from './middleware/requestId'
import routes from './routes'
import logger from './utils/logger'

const app: Express = express()

// Trust proxy - required when behind reverse proxy (nginx, load balancers)
app.set('trust proxy', 1)

// Request ID and logging - FIRST middleware to track all requests
app.use(requestId)
app.use(requestLogger)

// Security Middleware
// Helmet - sets various HTTP headers for security
app.use(helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false, // Disable in dev for easier debugging
    crossOriginEmbedderPolicy: false, // Allow loading external resources
}))

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.isProduction ? 100 : 1000, // 100 requests per 15 min in production
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health check and OAuth
        return req.path === '/' ||
            req.path === '/health' ||
            req.path.includes('/auth/google')
    }
})

// Apply rate limiting to API routes
app.use('/api/', limiter)

// Auth-specific rate limiting (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.isProduction ? 5 : 50, // Only 5 login attempts per 15 min in production
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful requests
})

app.use('/api/v1/auth/login', authLimiter)
app.use('/api/v1/auth/signup', authLimiter)

// Body parser with size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Data sanitization against NoSQL injection
// IMPORTANT: Must come AFTER body-parser to work correctly
app.use(mongoSanitize({
    replaceWith: '_'
}))

// Compression middleware - compress responses
app.use(compression())

// Serve static files from uploads directory
import path from 'path'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// CORS
app.use(corsMiddleware)

// Health check route
app.get('/', (_req, res) => {
    try {
        res.json({
            status: 'ok',
            message: 'QuietSummit API is running',
            environment: config.env,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        logger.error('Error in root endpoint:', error)
        res.status(500).json({ status: 'error', message: 'Internal server error' })
    }
})

app.get('/health', (_req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState
        const dbStatusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus] || 'unknown'

        res.json({
            status: dbStatus === 1 ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbStatusText,
            environment: config.env
        })
    } catch (error) {
        logger.error('Error in health endpoint:', error)
        res.status(500).json({ status: 'error', message: 'Health check failed' })
    }
})

// Start server
const startServer = async () => {
    try {
        logger.info('Starting server initialization...')
        logger.info(`Environment: ${config.env}`)
        logger.info(`Port: ${config.port}`)

        // Connect to database first
        await connectDatabase()
        logger.info('✅ Database connected successfully')

        // Initialize Passport after database is connected
        const passport = await import('./config/passport')
        app.use(passport.default.initialize())
        logger.info('✅ Passport initialized')

        // Routes - must be registered after Passport initialization
        app.use('/api/v1', routes)
        logger.info('✅ Routes registered')

        // Error handling - must be last
        app.use(notFound)
        app.use(errorHandler)

        const server = app.listen(config.port, () => {
            logger.info(`🚀 Server running in ${config.env} mode on port ${config.port}`)
            logger.info(`📡 API available at http://localhost:${config.port}/api/v1`)
            if (config.isDevelopment) {
                logger.info(`🔧 Development mode - enhanced logging enabled`)
            }
        })

        // Graceful shutdown
        const gracefulShutdown = (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`)
            server.close(() => {
                logger.info('HTTP server closed')
                process.exit(0)
            })

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout')
                process.exit(1)
            }, 10000)
        }

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
        process.on('SIGINT', () => gracefulShutdown('SIGINT'))

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('❌ Uncaught Exception:', error)
            logger.error('Stack:', error.stack)
            // In production, we might want to restart the service
            if (config.isProduction) {
                gracefulShutdown('UNCAUGHT_EXCEPTION')
            }
        })

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('❌ Unhandled Rejection at:', promise)
            logger.error('Reason:', reason)
            // In production, we might want to restart the service
            if (config.isProduction) {
                gracefulShutdown('UNHANDLED_REJECTION')
            }
        })

    } catch (error) {
        logger.error('❌ Failed to start server:', error)
        if (error instanceof Error) {
            logger.error('Error message:', error.message)
            logger.error('Error stack:', error.stack)
        }
        console.error('\n=== SERVER STARTUP FAILED ===')
        console.error('Check the logs above for details')
        console.error('Common issues:')
        console.error('1. Database connection failed - check MONGODB_URI')
        console.error('2. Missing environment variables')
        console.error('3. Port already in use')
        console.error('===========================\n')
        process.exit(1)
    }
}

startServer()

export default app
