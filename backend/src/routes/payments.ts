import { Router } from 'express'
import {
    createOrder,
    verifyPayment,
    getRazorpayKey,
    refundPayment,
} from '../controllers/paymentController'

const router = Router()

// Payment routes
router.post('/create-order', createOrder)
router.post('/verify', verifyPayment)
router.get('/key', getRazorpayKey)
router.post('/refund', refundPayment)

export default router
