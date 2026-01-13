import { Request, Response } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import logger from '../utils/logger'
import { config } from '../config/environment'

// Validate Razorpay configuration on startup
const isRazorpayConfigured = !!(config.razorpay.keyId && config.razorpay.keySecret)

if (!isRazorpayConfigured) {
    logger.error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.')
    logger.error('Payment endpoints will return errors until credentials are configured.')
}

// Initialize Razorpay (will be null if not configured)
const razorpay = isRazorpayConfigured ? new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
}) : null

// Helper function to check Razorpay configuration
const checkRazorpayConfig = (res: Response): boolean => {
    if (!isRazorpayConfigured || !razorpay) {
        res.status(503).json({
            success: false,
            error: 'Payment gateway not configured. Please contact support.',
        })
        return false
    }
    return true
}

// Create Razorpay order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if Razorpay is configured
        if (!checkRazorpayConfig(res)) return

        const { amount, currency = 'INR', receipt, notes } = req.body

        logger.info('Creating Razorpay order:', { amount, currency, receipt })

        if (!amount || amount <= 0) {
            res.status(400).json({
                success: false,
                error: 'Valid amount is required',
            })
            return
        }

        // Ensure amount is a valid number
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
            res.status(400).json({
                success: false,
                error: 'Amount must be a valid positive number',
            })
            return
        }

        const options = {
            amount: Math.round(numAmount * 100), // Convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {},
        }

        logger.info('Razorpay order options:', options)

        const order = await razorpay!.orders.create(options)

        logger.info('Razorpay order created successfully:', { orderId: order.id, amount: order.amount })

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
        // Check if Razorpay is configured
        if (!checkRazorpayConfig(res)) return

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
            .createHmac('sha256', config.razorpay.keySecret)
            .update(body.toString())
            .digest('hex')

        // Compare signatures
        const isAuthentic = expectedSignature === razorpay_signature

        if (isAuthentic) {
            // Fetch payment details from Razorpay
            const payment = await razorpay!.payments.fetch(razorpay_payment_id)

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
                key: config.razorpay.keyId,
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
        // Check if Razorpay is configured
        if (!checkRazorpayConfig(res)) return

        const { paymentId, amount, notes } = req.body

        if (!paymentId) {
            res.status(400).json({
                success: false,
                error: 'Payment ID is required',
            })
            return
        }

        const refund = await razorpay!.payments.refund(paymentId, {
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
