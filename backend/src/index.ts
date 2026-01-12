import express, { Express } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import { config } from './config/environment'
import { connectDatabase } from './config/database'
import { corsMiddleware } from './middleware/cors'
import { errorHandler, notFound } from './middleware/errorHandler'
import routes from './routes'
import logger from './utils/logger'
import passport from './config/passport'

const app: Express = express()

// Trust proxy - required when behind reverse proxy (nginx, load balancers)
app.set('trust proxy', 1)

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
        // Skip rate limiting for health check
        return req.path === '/' || req.path === '/health'
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
app.use(mongoSanitize())

// Compression middleware - compress responses
app.use(compression())

// CORS
app.use(corsMiddleware)

// Initialize Passport
app.use(passport.initialize())

// Logging middleware
app.use((req, _res, next) => {
    logger.http(`${req.method} ${req.path}`)
    next()
})

// Health check route
app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'QuietSummit API is running', environment: config.env })
})

app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
})

// Routes
app.use('/api/v1', routes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Start server
const startServer = async () => {
    try {
        await connectDatabase()

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

    } catch (error) {
        logger.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()

export default app
