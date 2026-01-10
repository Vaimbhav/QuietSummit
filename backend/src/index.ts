import express, { Express } from 'express'
import { config } from './config/environment'
import { connectDatabase } from './config/database'
import { corsMiddleware } from './middleware/cors'
import { errorHandler, notFound } from './middleware/errorHandler'
import routes from './routes'
import logger from './utils/logger'
import passport from './config/passport'

const app: Express = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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
  res.json({ status: 'ok', message: 'QuietSummit API is running' })
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

    app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`)
      logger.info(`API available at http://localhost:${config.port}/api/v1`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
