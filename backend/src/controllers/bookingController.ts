import { Request, Response } from 'express'
import Booking from '../models/Booking'
import Journey from '../models/Journey'
import SignUp from '../models/SignUp'
import logger from '../utils/logger'
import { applyCoupon } from './couponController'

// Create a new booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            email,
            journeyId,
            departureDate,
            numberOfTravelers,
            travelers,
            roomPreference,
            addOns,
            specialRequests,
            totalAmount,
            paymentId,
            orderId,
            discount,
            couponDetails,
        } = req.body

        // Get email from token if authenticated, otherwise use request body
        const userEmail = req.user?.email || email

        // Validate required fields
        if (!userEmail || !journeyId || !departureDate || !numberOfTravelers || !totalAmount) {
            res.status(400).json({
                success: false,
                error: 'Missing required booking information',
            })
            return
        }

        // Find member
        const member = await SignUp.findOne({ email: userEmail.toLowerCase() })
        if (!member) {
            res.status(404).json({
                success: false,
                error: 'Member not found. Please sign up first.',
            })
            return
        }

        // Find journey
        const journey = await Journey.findById(journeyId)
        if (!journey) {
            res.status(404).json({
                success: false,
                error: 'Journey not found',
            })
            return
        }

        // Calculate end date based on journey duration
        const startDate = new Date(departureDate)
        const endDate = new Date(startDate)
        const durationDays = typeof journey.duration === 'number' ? journey.duration : journey.duration?.days || 5
        endDate.setDate(endDate.getDate() + durationDays)

        // Create booking
        const booking = await Booking.create({
            memberId: member._id,
            memberEmail: member.email,
            memberName: member.name,
            journeyId: journey._id,
            journeyTitle: journey.title,
            destination: journey.destination || journey.location?.region || 'Adventure',
            startDate,
            endDate,
            duration: durationDays,
            numberOfTravelers,
            travelers: travelers || [],
            roomPreference: roomPreference || 'double',
            addOns: addOns || [],
            specialRequests: specialRequests || '',
            totalAmount,
            subtotal: totalAmount + (discount || 0),
            discount: discount || 0,
            couponDetails: couponDetails || undefined,
            bookingStatus: 'confirmed',
            paymentStatus: paymentId ? 'paid' : 'pending',
            paymentDetails: {
                razorpayOrderId: orderId || '',
                razorpayPaymentId: paymentId || '',
                amount: totalAmount,
                currency: 'INR',
                paidAt: paymentId ? new Date() : undefined,
            },
        }) as any

        // If coupon was used, increment its usage count
        if (couponDetails?.couponId) {
            await applyCoupon(couponDetails.couponId)
        }

        logger.info(`Booking created: ${booking._id} for member: ${member.email}`)

        res.status(201).json({
            success: true,
            message: 'Booking confirmed successfully!',
            data: {
                bookingId: booking._id,
                bookingReference: `QS${booking._id.toString().slice(-8).toUpperCase()}`,
                journey: journey.title,
                destination: journey.destination || journey.location?.region,
                startDate: booking.startDate,
                endDate: booking.endDate,
                travelers: numberOfTravelers,
                totalAmount: booking.totalAmount,
                status: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
            },
        })
    } catch (error: any) {
        logger.error('Error creating booking:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to create booking',
            details: error.message,
        })
    }
}

// Get booking by ID
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params

        const booking = await Booking.findById(id)
            .populate('memberId', 'name email phone')
            .populate('journeyId')

        if (!booking) {
            res.status(404).json({
                success: false,
                error: 'Booking not found',
            })
            return
        }

        res.status(200).json({
            success: true,
            data: booking,
        })
    } catch (error: any) {
        logger.error('Error fetching booking:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking',
        })
    }
}

// Get all bookings for a member
export const getMemberBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const userEmail = req.user?.email || req.query.email

        if (!userEmail) {
            res.status(400).json({
                success: false,
                error: 'Email is required',
            })
            return
        }

        const member = await SignUp.findOne({ email: userEmail.toString().toLowerCase() })
        if (!member) {
            res.status(404).json({
                success: false,
                error: 'Member not found',
            })
            return
        }

        const bookings = await Booking.find({ memberId: member._id })
            .populate('journeyId')
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        })
    } catch (error: any) {
        logger.error('Error fetching member bookings:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings',
        })
    }
}

// Cancel booking
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { reason } = req.body

        const booking = await Booking.findById(id)
        if (!booking) {
            res.status(404).json({
                success: false,
                error: 'Booking not found',
            })
            return
        }

        if (booking.bookingStatus === 'cancelled') {
            res.status(400).json({
                success: false,
                error: 'Booking is already cancelled',
            })
            return
        }

        booking.bookingStatus = 'cancelled'
        booking.specialRequests = `${booking.specialRequests}\nCancellation reason: ${reason || 'Not specified'}`
        await booking.save()

        logger.info(`Booking cancelled: ${booking._id}`)

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking,
        })
    } catch (error: any) {
        logger.error('Error cancelling booking:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to cancel booking',
        })
    }
}

// Calculate booking price
export const calculatePrice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { journeyId, numberOfTravelers, addOns } = req.body

        if (!journeyId || !numberOfTravelers) {
            res.status(400).json({
                success: false,
                error: 'Journey ID and number of travelers are required',
            })
            return
        }

        const journey = await Journey.findById(journeyId)
        if (!journey) {
            res.status(404).json({
                success: false,
                error: 'Journey not found',
            })
            return
        }

        // Calculate base price
        let basePrice = (journey.price || journey.basePrice || 15000) * numberOfTravelers

        // Add-on prices
        const addOnPrices: { [key: string]: number } = {
            insurance: 500 * numberOfTravelers,
            airportTransfer: 1500,
            singleRoom: 2000 * numberOfTravelers,
        }

        let addOnsTotal = 0
        if (addOns && Array.isArray(addOns)) {
            addOns.forEach((addOn: string) => {
                addOnsTotal += addOnPrices[addOn] || 0
            })
        }

        // Calculate taxes (5% GST)
        const subtotal = basePrice + addOnsTotal
        const taxes = Math.round(subtotal * 0.05)
        const total = subtotal + taxes

        res.status(200).json({
            success: true,
            data: {
                basePrice,
                addOnsTotal,
                subtotal,
                taxes,
                total,
                breakdown: {
                    pricePerPerson: journey.price || journey.basePrice || 15000,
                    numberOfTravelers,
                    addOns: addOns || [],
                    taxRate: '5%',
                },
            },
        })
    } catch (error: any) {
        logger.error('Error calculating price:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to calculate price',
        })
    }
}
