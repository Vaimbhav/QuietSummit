import { Router } from 'express'
import {
    createOrder,
    verifyPayment,
    getRazorpayKey,
    refundPayment,
} from '../controllers/paymentController'
import { validateRequest } from '../middleware/validate'
import { createPaymentOrderSchema, verifyPaymentSchema } from '../validators/schemas'

const router = Router()

// Payment routes
router.post('/create-order', validateRequest(createPaymentOrderSchema), createOrder)
router.post('/verify', validateRequest(verifyPaymentSchema), verifyPayment)
router.get('/key', getRazorpayKey)
router.post('/refund', refundPayment)

export default router
