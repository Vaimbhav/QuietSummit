import { Request, Response } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import logger from '../utils/logger'

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

// Create Razorpay order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount, currency = 'INR', receipt, notes } = req.body

        if (!amount) {
            res.status(400).json({
                success: false,
                error: 'Amount is required',
            })
            return
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {},
        }

        const order = await razorpay.orders.create(options)

        res.status(201).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
            },
        })
    } catch (error: any) {
        logger.error('Error creating Razorpay order:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to create payment order',
            details: error.message,
        })
    }
}

// Verify Razorpay payment signature
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({
                success: false,
                error: 'Missing payment verification parameters',
            })
            return
        }

        // Generate signature
        const body = razorpay_order_id + '|' + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex')

        // Compare signatures
        const isAuthentic = expectedSignature === razorpay_signature

        if (isAuthentic) {
            // Fetch payment details from Razorpay
            const payment = await razorpay.payments.fetch(razorpay_payment_id)

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    status: payment.status,
                    amount: Number(payment.amount) / 100, // Convert back to rupees
                    method: payment.method,
                    email: payment.email,
                    contact: payment.contact,
                },
            })
        } else {
            res.status(400).json({
                success: false,
                error: 'Payment verification failed',
            })
        }
    } catch (error: any) {
        logger.error('Error verifying payment:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment',
            details: error.message,
        })
    }
}

// Get Razorpay key for frontend
export const getRazorpayKey = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            data: {
                key: process.env.RAZORPAY_KEY_ID || '',
            },
        })
    } catch (error: any) {
        logger.error('Error fetching Razorpay key:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment key',
        })
    }
}

// Refund payment
export const refundPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paymentId, amount, notes } = req.body

        if (!paymentId) {
            res.status(400).json({
                success: false,
                error: 'Payment ID is required',
            })
            return
        }

        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
            notes: notes || {},
        })

        res.status(200).json({
            success: true,
            message: 'Refund initiated successfully',
            data: {
                refundId: refund.id,
                paymentId: refund.payment_id,
                amount: Number(refund.amount) / 100 || 0,
                status: refund.status,
            },
        })
    } catch (error: any) {
        logger.error('Error processing refund:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to process refund',
            details: error.message,
        })
    }
}
