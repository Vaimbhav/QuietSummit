import { Router } from 'express'
import journeysRouter from './journeys'
import contactRouter from './contact'
import signUpRouter from './signUp'
import authRouter from './auth'
import bookingsRouter from './bookings'
import paymentsRouter from './payments'
import couponsRouter from './coupons'
import chatRouter from './chat'

const router = Router()

router.use('/journeys', journeysRouter)
router.use('/contact', contactRouter)
router.use('/signup', signUpRouter)
router.use('/auth', authRouter)
router.use('/bookings', bookingsRouter)
router.use('/payments', paymentsRouter)
router.use('/coupons', couponsRouter)
router.use('/chat', chatRouter)

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    })
})

export default router
