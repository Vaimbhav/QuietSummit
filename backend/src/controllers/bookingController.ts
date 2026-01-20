import { Request, Response } from 'express'
import crypto from 'crypto'
import { config } from '../config/environment'
import Booking from '../models/Booking'
import Journey from '../models/Journey'
import { Property } from '../models/Property' // Import Property model
import SignUp from '../models/SignUp'
import {
    sendBookingConfirmationEmail,
    sendNewBookingNotificationToHost,
} from '../services/emailService'
import logger from '../utils/logger'
import { applyCoupon } from './couponController'

// Create a new booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const {

            journeyId,
            departureDate,
            checkIn,
            checkOut,
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
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body

        // SECURITY: Always use authenticated user's email, ignore body email
        const userEmail = (req.user as any)?.email


        // Validate required fields
        if (!userEmail || !journeyId || !numberOfTravelers || !totalAmount) {
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

        // Find journey or property
        let journey: any = await Journey.findById(journeyId)
        let isProperty = false

        if (!journey) {
            journey = await Property.findById(journeyId)
            isProperty = !!journey
        }

        if (!journey) {
            res.status(404).json({
                success: false,
                error: 'Journey/Property not found',
            })
            return
        }

        // Handle Property-specific validation
        if (isProperty) {
            if (!checkIn || !checkOut) {
                res.status(400).json({
                    success: false,
                    error: 'Check-in and check-out dates are required for property bookings',
                })
                return
            }

            const checkInDate = new Date(checkIn)
            const checkOutDate = new Date(checkOut)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Validate dates
            if (checkInDate < today) {
                res.status(400).json({
                    success: false,
                    error: 'Check-in date must be in the future',
                })
                return
            }

            if (checkOutDate <= checkInDate) {
                res.status(400).json({
                    success: false,
                    error: 'Check-out date must be after check-in date',
                })
                return
            }

            // Validate guest capacity
            if (numberOfTravelers > journey.capacity?.guests) {
                res.status(400).json({
                    success: false,
                    error: `This property can accommodate maximum ${journey.capacity.guests} guests`,
                })
                return
            }
        } else {
            // Journey validation
            if (!departureDate) {
                res.status(400).json({
                    success: false,
                    error: 'Departure date is required for journey bookings',
                })
                return
            }

            const departureDateTime = new Date(departureDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (departureDateTime < today) {
                res.status(400).json({
                    success: false,
                    error: 'Departure date must be in the future',
                })
                return
            }
        }

        // Calculate dates and duration
        let startDate: Date
        let endDate: Date
        let durationDays: number

        if (isProperty) {
            startDate = new Date(checkIn)
            endDate = new Date(checkOut)
            durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        } else {
            startDate = new Date(departureDate)
            endDate = new Date(startDate)
            durationDays = typeof journey.duration === 'number'
                ? journey.duration
                : (journey.duration?.days || 5)
            endDate.setDate(endDate.getDate() + durationDays)
        }

        // Calculate correct subtotal (before discount was applied)
        const subtotal = totalAmount + (discount || 0)



        // Set initial status to pending (unless verified payment below)
        let finalStatus = 'pending'
        let finalPaymentStatus = 'pending'
        let paidAt = undefined

        // Verify Payment (if provided)
        logger.info(`Payment verification - received razorpay_payment_id: ${razorpay_payment_id ? 'YES' : 'NO'}, razorpay_order_id: ${razorpay_order_id ? 'YES' : 'NO'}, razorpay_signature: ${razorpay_signature ? 'YES' : 'NO'}`)

        if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
            try {
                const body = razorpay_order_id + '|' + razorpay_payment_id
                const expectedSignature = crypto
                    .createHmac('sha256', config.razorpay.keySecret)
                    .update(body.toString())
                    .digest('hex')

                logger.info(`Payment signature match: ${expectedSignature === razorpay_signature}`)

                if (expectedSignature === razorpay_signature) {
                    finalStatus = 'confirmed'
                    finalPaymentStatus = 'paid'
                    paidAt = new Date()
                    logger.info(`✓ Payment verified successfully for booking request - Setting status to CONFIRMED`)
                } else {
                    logger.warn(`✗ Invalid payment signature for order ${razorpay_order_id} - Expected: ${expectedSignature.substring(0, 10)}..., Got: ${razorpay_signature.substring(0, 10)}...`)
                    // We still create the booking but as PENDING/UNPAID
                }
            } catch (err) {
                logger.error('Error verifying payment signature:', err)
            }
        } else {
            logger.info(`No payment details provided - creating booking with PENDING status`)
        }

        // Create booking with detailed logging
        logger.info('Creating booking with data:', {
            memberId: member._id,
            journeyId: journey._id,
            status: finalStatus,
            paymentStatus: finalPaymentStatus,
            amount: totalAmount,
        })

        const booking = await Booking.create({
            memberId: member._id,
            // Also save user and hostId fields for robust querying
            user: member._id,
            hostId: isProperty ? journey.host : undefined,
            memberEmail: member.email,
            memberName: member.name,
            journeyId: journey._id,
            journeyModel: isProperty ? 'Property' : 'Journey',
            journeyTitle: journey.title,
            destination: journey.destination || journey.location?.region || (journey.address ? `${journey.address.city}, ${journey.address.country}` : 'Adventure'),
            startDate,
            endDate,
            checkIn: isProperty ? new Date(checkIn) : undefined,
            checkOut: isProperty ? new Date(checkOut) : undefined,
            duration: durationDays,
            numberOfTravelers,
            travelers: travelers || [],
            roomPreference: roomPreference || 'double',
            addOns: addOns || [],
            specialRequests: specialRequests || '',
            totalAmount,
            subtotal,
            discount: discount || 0,
            couponDetails: couponDetails || undefined,
            bookingStatus: finalStatus,
            paymentStatus: finalPaymentStatus,
            paymentDetails: {
                razorpayOrderId: razorpay_order_id || orderId || '',
                razorpayPaymentId: razorpay_payment_id || paymentId || '',
                amount: totalAmount,
                currency: 'INR',
                paidAt: paidAt,
            },
        }) as any

        // If coupon was used, increment its usage count
        if (couponDetails?.couponId) {
            await applyCoupon(couponDetails.couponId)
        }

        logger.info(`Booking created successfully: ${booking._id} for member: ${member.email} | Status: ${finalStatus} | Payment Status: ${finalPaymentStatus} | Journey Model: ${isProperty ? 'Property' : 'Journey'}`)

        // IMPORTANT: Send response FIRST before email operations to prevent timeout/failure
        res.status(201).json({
            success: true,
            bookingId: booking._id,
            booking: booking,
            data: booking,
        })

        // Send emails asynchronously in background (won't block response)
        // This prevents booking creation from failing if email sending has issues
        setImmediate(async () => {
            try {
                // Get host info once if needed
                let hostInfo = null;
                if (journey.host) {
                    hostInfo = await SignUp.findById(journey.host);

                    // Send email notification to host
                    if (hostInfo) {
                        await sendNewBookingNotificationToHost(hostInfo.email, {
                            hostName: hostInfo.name,
                            propertyName: journey.title,
                            guestName: (req.user as any)?.name || member.name,
                            guestEmail: (req.user as any)?.email || member.email,
                            checkIn: new Date(startDate).toLocaleDateString(),
                            checkOut: new Date(endDate).toLocaleDateString(),
                            totalPrice: totalAmount,
                            guests: numberOfTravelers
                        }).catch(err => logger.error('Failed to send new booking email to host:', err));
                    }
                }

                // Send booking confirmation email to guest with detailed receipt
                await sendBookingConfirmationEmail(member.email, {
                    guestName: member.name,
                    propertyName: journey.title,
                    checkIn: isProperty ? new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '',
                    checkOut: isProperty ? new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '',
                    totalPrice: totalAmount,
                    hostName: hostInfo?.name,
                    hostEmail: hostInfo?.email,
                    bookingReference: booking._id.toString(),
                    numberOfTravelers,
                    travelers: travelers || [],
                    duration: durationDays,
                    destination: booking.destination,
                    departureDate: isProperty ? '' : new Date(departureDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }),
                    roomPreference: roomPreference || 'double',
                    subtotal,
                    discount: discount || 0,
                    paymentMethod: 'Razorpay',
                    transactionId: razorpay_payment_id || paymentId || ''
                }).catch(err => logger.error('Failed to send booking confirmation email to guest:', err));

                logger.info(`Email notifications sent successfully for booking: ${booking._id}`);
            } catch (emailError) {
                logger.error('Error in background email sending:', emailError);
            }
        })
    } catch (error: any) {
        logger.error('Error creating booking:', {
            error: error.message,
            stack: error.stack,
            email: (req.user as any)?.email,
            journeyId: req.body.journeyId,
            razorpayPaymentId: req.body.razorpay_payment_id,
            razorpayOrderId: req.body.razorpay_order_id,
        })
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
        const userEmail = (req.user as any)?.email || req.query.email

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

        const bookings = await Booking.find({
            $or: [
                { memberId: member._id },
                { user: member._id }
            ]
        })
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

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { status } = req.body

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                error: 'Invalid status',
            })
            return
        }

        const booking = await Booking.findById(id)
        if (!booking) {
            res.status(404).json({
                success: false,
                error: 'Booking not found',
            })
            return
        }

        const previousStatus = booking.bookingStatus
        booking.bookingStatus = status

        // If status changed to confirmed, ensure payment logic (if needed)
        // If status changed to cancelled, handle refunds logic (placeholder)

        await booking.save()

        logger.info(`Booking ${id} status updated from ${previousStatus} to ${status}`)

        // Send email based on status change
        if (status === 'confirmed') {
            // Populate guest details to send email
            await booking.populate('memberId', 'name email');
            await booking.populate({
                path: 'journeyId',
                populate: { path: 'host', select: 'name email' }
            });

            const guest = booking.memberId as any;
            const journey = booking.journeyId as any;
            const host = journey.host as any;

            if (guest && guest.email) {
                await sendBookingConfirmationEmail(guest.email, {
                    guestName: guest.name,
                    propertyName: journey.title,
                    checkIn: new Date(booking.startDate).toLocaleDateString(),
                    checkOut: new Date(booking.endDate).toLocaleDateString(),
                    totalPrice: booking.totalAmount,
                    hostName: host?.name || 'QuietSummit Team',
                    hostEmail: host?.email || 'Nagendrarajput9753@gmail.com'
                }).catch(err => logger.error('Failed to send confirmation email to guest:', err));
            }
        }

        res.json({
            success: true,
            message: `Booking ${status}`,
            data: booking
        })
    } catch (error: any) {
        logger.error('Error updating booking status:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update booking status',
        })
    }
}

