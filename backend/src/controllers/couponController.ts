import { Request, Response } from 'express'
import { Coupon } from '../models/Coupon'

export const getActiveCoupons = async (_req: Request, res: Response) => {
    try {
        const now = new Date()
        console.log('Fetching coupons. Current date:', now)

        // First, check all coupons in the database
        const allCoupons = await Coupon.find({})
        console.log('Total coupons in database:', allCoupons.length)

        if (allCoupons.length > 0) {
            const sample = allCoupons[0]
            console.log('Sample coupon validFrom type:', typeof sample.validFrom, sample.validFrom)
            console.log('Sample coupon validUntil type:', typeof sample.validUntil, sample.validUntil)
        }

        // Find all active coupons that are currently valid
        // Convert string dates to Date objects if needed
        const coupons = await Coupon.find({
            isActive: true,
            $expr: {
                $and: [
                    { $lte: [{ $toDate: '$validFrom' }, now] },
                    { $gte: [{ $toDate: '$validUntil' }, now] }
                ]
            }
        }).select('-__v -createdAt -updatedAt')

        console.log('Coupons matching active filter:', coupons.length)

        // Filter out coupons that have reached usage limit
        const availableCoupons = coupons.filter(
            (coupon) => !coupon.usageLimit || coupon.usedCount < coupon.usageLimit
        )

        console.log('Final available coupons:', availableCoupons.length)

        return res.status(200).json({
            success: true,
            count: availableCoupons.length,
            data: availableCoupons,
        })
    } catch (error) {
        console.error('Get active coupons error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch coupons',
        })
    }
}

export const validateCoupon = async (req: Request, res: Response) => {
    try {
        const { code, journeyId, subtotal } = req.body

        if (!code || !journeyId || !subtotal) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            })
        }

        // Find the coupon
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
        })

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code',
            })
        }

        // Check if coupon is valid (date range)
        const now = new Date()
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return res.status(400).json({
                success: false,
                message: 'Coupon has expired or is not yet valid',
            })
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Coupon usage limit reached',
            })
        }

        // Check minimum purchase
        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase of ₹${coupon.minPurchase} required`,
            })
        }

        // Check if coupon is applicable to this journey
        if (coupon.applicableJourneys.length > 0) {
            const isApplicable = coupon.applicableJourneys.some(
                (id) => id.toString() === journeyId
            )
            if (!isApplicable) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon not applicable to this journey',
                })
            }
        }

        // Calculate discount
        let discount = 0
        if (coupon.discountType === 'percentage') {
            discount = Math.round((subtotal * coupon.discountValue) / 100)
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount)
            }
        } else {
            discount = coupon.discountValue
        }

        return res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            data: {
                couponId: coupon._id,
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discount,
            },
        })
    } catch (error) {
        console.error('Validate coupon error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to validate coupon',
        })
    }
}

export const applyCoupon = async (couponId: string) => {
    try {
        await Coupon.findByIdAndUpdate(couponId, {
            $inc: { usedCount: 1 },
        })
    } catch (error) {
        console.error('Apply coupon error:', error)
    }
}
