import express from 'express'
import { getActiveCoupons, validateCoupon } from '../controllers/couponController'

const router = express.Router()

// Get active coupons (alias for /active)
router.get('/', getActiveCoupons)
router.get('/active', getActiveCoupons)
router.post('/validate', validateCoupon)

export default router
