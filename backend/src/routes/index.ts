import { Router } from 'express'
import journeysRouter from './journeys'
import contactRouter from './contact'
import signUpRouter from './signUp'
import authRouter from './auth'
import bookingsRouter from './bookings'
import paymentsRouter from './payments'
import payoutsRouter from './payouts'
import couponsRouter from './coupons'
import chatRouter from './chat'
import uploadRouter from './upload'
import calendarRouter from './calendar'
import wishlistsRouter from './wishlists'
import propertiesRouter from './properties'
import hostsRouter from './hosts'
import reviewsRouter from './reviews'
import adminRouter from './admin'
import notificationsRouter from './notifications'
import searchRouter from './search'
import profileRouter from './profile'

const router = Router()

router.use('/journeys', journeysRouter)
router.use('/contact', contactRouter)
router.use('/signup', signUpRouter)
router.use('/auth', authRouter)
router.use('/properties', propertiesRouter)
router.use('/hosts', hostsRouter)
router.use('/bookings', bookingsRouter)
router.use('/payments', paymentsRouter)
router.use('/payouts', payoutsRouter)
router.use('/coupons', couponsRouter)
router.use('/chat', chatRouter)
router.use('/upload', uploadRouter)
router.use('/calendar', calendarRouter)
router.use('/wishlists', wishlistsRouter)
router.use('/reviews', reviewsRouter)
router.use('/admin', adminRouter)
router.use('/notifications', notificationsRouter)
router.use('/search', searchRouter)
router.use('/profile', profileRouter)

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    })
})

export default router
