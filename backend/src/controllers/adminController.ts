import { Request, Response } from 'express'
import SignUp from '../models/SignUp'
import { Property } from '../models/Property'
import Booking from '../models/Booking'
import Review from '../models/Review'
import Payout from '../models/Payout'
import logger from '../utils/logger'

// Get all users with filters and pagination
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const role = req.query.role as string
        const status = req.query.status as string
        const search = req.query.search as string

        // Build filter
        const filter: any = {}
        if (role) filter.role = role
        if (status) filter.status = status
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ]
        }

        const users = await SignUp.find(filter)
            .select('-password -confirmationToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await SignUp.countDocuments(filter)

        res.status(200).json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching users:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
            message: (error as Error).message,
        })
        return
    }
}

// Update user status
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params
        const { status } = req.body

        if (!status || !['pending', 'confirmed', 'unsubscribed'].includes(status)) {
            res.status(400).json({
                success: false,
                error: 'Valid status required (pending, confirmed, unsubscribed)',
            })
            return
        }

        const user = await SignUp.findByIdAndUpdate(
            userId,
            { status },
            { new: true, select: '-password -confirmationToken' }
        )

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        logger.info(`User ${userId} status updated to ${status}`)
        res.status(200).json({
            success: true,
            message: 'User status updated',
            user,
        })
        return
    } catch (error) {
        logger.error('Error updating user status:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update user status',
            message: (error as Error).message,
        })
        return
    }
}

// Update user role
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params
        const { role } = req.body

        if (!role || !['member', 'host', 'admin'].includes(role)) {
            res.status(400).json({
                success: false,
                error: 'Valid role required (member, host, admin)',
            })
            return
        }

        const user = await SignUp.findByIdAndUpdate(
            userId,
            { role, isHost: role === 'host' || role === 'admin' },
            { new: true, select: '-password -confirmationToken' }
        )

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        logger.info(`User ${userId} role updated to ${role}`)
        res.status(200).json({
            success: true,
            message: 'User role updated',
            user,
        })
        return
    } catch (error) {
        logger.error('Error updating user role:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update user role',
            message: (error as Error).message,
        })
        return
    }
}

// Get all properties with filters
export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const status = req.query.status as string
        const search = req.query.search as string

        // Build filter
        const filter: any = {}
        if (status) {
            if (status === 'pending') {
                filter.status = 'pending_review';
            } else if (status === 'active') {
                filter.status = 'approved';
            } else {
                filter.status = status;
            }
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'address.city': { $regex: search, $options: 'i' } },
            ]
        }

        const properties = await Property.find(filter)
            .populate('host', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Property.countDocuments(filter)

        res.status(200).json({
            success: true,
            properties,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching properties:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch properties',
            message: (error as Error).message,
        })
        return
    }
}

// Approve property
export const approveProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params
        const adminId = (req.user as any)?.id || (req.user as any)?._id?.toString()

        const property = await Property.findByIdAndUpdate(
            propertyId,
            {
                status: 'approved',
                isActive: true,
                'verificationStatus.isVerified': true,
                'verificationStatus.verifiedAt': new Date(),
                'verificationStatus.verifiedBy': adminId,
            },
            { new: true }
        ).populate('host', 'name email')

        if (!property) {
            res.status(404).json({
                success: false,
                error: 'Property not found',
            })
            return
        }

        logger.info(`Property ${propertyId} approved by admin ${adminId}`)
        res.status(200).json({
            success: true,
            message: 'Property approved successfully',
            property,
        })
        return
    } catch (error) {
        logger.error('Error approving property:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to approve property',
            message: (error as Error).message,
        })
        return
    }
}

// Reject property
export const rejectProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params
        const { reason } = req.body
        const adminId = (req.user as any)?.id || (req.user as any)?._id?.toString()

        if (!reason) {
            res.status(400).json({
                success: false,
                error: 'Rejection reason is required',
            })
            return
        }

        const property = await Property.findByIdAndUpdate(
            propertyId,
            {
                status: 'rejected',
                'verificationStatus.isVerified': false,
                'verificationStatus.rejectionReason': reason,
                'verificationStatus.verifiedBy': adminId,
            },
            { new: true }
        ).populate('host', 'name email')

        if (!property) {
            res.status(404).json({
                success: false,
                error: 'Property not found',
            })
            return
        }

        logger.info(`Property ${propertyId} rejected by admin ${adminId}`)
        res.status(200).json({
            success: true,
            message: 'Property rejected',
            property,
        })
        return
    } catch (error) {
        logger.error('Error rejecting property:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to reject property',
            message: (error as Error).message,
        })
        return
    }
}

// Delete property
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params
        const adminId = (req.user as any)?.id || (req.user as any)?._id?.toString()

        const property = await Property.findByIdAndDelete(propertyId)

        if (!property) {
            res.status(404).json({
                success: false,
                error: 'Property not found',
            })
            return
        }

        logger.info(`Property ${propertyId} deleted by admin ${adminId}`)
        res.status(200).json({
            success: true,
            message: 'Property deleted successfully',
        })
        return
    } catch (error) {
        logger.error('Error deleting property:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to delete property',
            message: (error as Error).message,
        })
        return
    }
}

// Get all bookings with filters
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const bookingStatus = req.query.bookingStatus as string
        const paymentStatus = req.query.paymentStatus as string

        // Build filter
        const filter: any = {}
        if (bookingStatus) filter.bookingStatus = bookingStatus
        if (paymentStatus) filter.paymentStatus = paymentStatus

        const bookings = await Booking.find(filter)
            .populate('memberId', 'name email')
            .populate('journeyId', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Booking.countDocuments(filter)

        res.status(200).json({
            success: true,
            bookings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching bookings:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings',
            message: (error as Error).message,
        })
        return
    }
}

// Get platform statistics
export const getPlatformStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        // User statistics
        const totalUsers = await SignUp.countDocuments()
        const totalHosts = await SignUp.countDocuments({ role: 'host' })
        const totalMembers = await SignUp.countDocuments({ role: 'member' })
        const confirmedUsers = await SignUp.countDocuments({ status: 'confirmed' })

        // Property statistics
        const totalProperties = await Property.countDocuments()
        const approvedProperties = await Property.countDocuments({ status: 'approved' })
        const pendingProperties = await Property.countDocuments({ status: 'pending_review' })
        const rejectedProperties = await Property.countDocuments({ status: 'rejected' })

        // Booking statistics
        const totalBookings = await Booking.countDocuments()
        const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' })
        const completedBookings = await Booking.countDocuments({ bookingStatus: 'completed' })
        const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' })

        // Revenue statistics
        const revenueStats = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    averageBookingValue: { $avg: '$totalAmount' },
                },
            },
        ])

        // Review statistics
        const totalReviews = await Review.countDocuments()
        const reportedReviews = await Review.countDocuments({ isReported: true })

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    hosts: totalHosts,
                    members: totalMembers,
                    confirmed: confirmedUsers,
                },
                properties: {
                    total: totalProperties,
                    approved: approvedProperties,
                    pending: pendingProperties,
                    rejected: rejectedProperties,
                },
                bookings: {
                    total: totalBookings,
                    confirmed: confirmedBookings,
                    completed: completedBookings,
                    cancelled: cancelledBookings,
                },
                revenue: {
                    total: revenueStats[0]?.totalRevenue || 0,
                    average: revenueStats[0]?.averageBookingValue || 0,
                },
                reviews: {
                    total: totalReviews,
                    reported: reportedReviews,
                },
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching platform stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch platform statistics',
            message: (error as Error).message,
        })
        return
    }
}

// Get reported reviews
export const getReportedReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const reviews = await Review.find({ isReported: true })
            .populate('guestId', 'name email')
            .populate('propertyId', 'title')
            .populate('hostId', 'name email')
            .sort({ reportedAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Review.countDocuments({ isReported: true })

        res.status(200).json({
            success: true,
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching reported reviews:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reported reviews',
            message: (error as Error).message,
        })
        return
    }
}

// Remove reported review
export const removeReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reviewId } = req.params

        const review = await Review.findByIdAndDelete(reviewId)

        if (!review) {
            res.status(404).json({
                success: false,
                error: 'Review not found',
            })
            return
        }

        logger.info(`Review ${reviewId} removed by admin`)
        res.status(200).json({
            success: true,
            message: 'Review removed successfully',
        })
        return
    } catch (error) {
        logger.error('Error removing review:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to remove review',
            message: (error as Error).message,
        })
        return
    }
}

// Dismiss review report (mark as not reported)
export const dismissReviewReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reviewId } = req.params

        const review = await Review.findByIdAndUpdate(
            reviewId,
            {
                isReported: false,
                reportReason: undefined,
                reportedAt: undefined,
            },
            { new: true }
        )

        if (!review) {
            res.status(404).json({
                success: false,
                error: 'Review not found',
            })
            return
        }

        logger.info(`Review report ${reviewId} dismissed by admin`)
        res.status(200).json({
            success: true,
            message: 'Report dismissed',
            review,
        })
        return
        return
    } catch (error) {
        logger.error('Error dismissing review report:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to dismiss report',
            message: (error as Error).message,
        })
        return
    }
}

// Get all payouts (Admin)
export const getAllPayouts = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const status = req.query.status as string

        const filter: any = {}
        if (status) filter.status = status

        const payouts = await Payout.find(filter)
            .populate('hostId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Payout.countDocuments(filter)

        res.status(200).json({
            success: true,
            payouts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching admin payouts:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payouts',
            message: (error as Error).message,
        })
        return
    }
}

// Approve Payout (Admin)
export const approvePayout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { payoutId } = req.params
        const { referenceId } = req.body // Admin can provide transaction reference

        if (!referenceId) {
            res.status(400).json({
                success: false,
                error: 'Transaction reference ID is required for approval',
            })
            return
        }

        const payout = await Payout.findByIdAndUpdate(
            payoutId,
            {
                status: 'completed',
                referenceId,
                processedAt: new Date(),
            },
            { new: true }
        ).populate('hostId', 'name email')

        if (!payout) {
            res.status(404).json({
                success: false,
                error: 'Payout request not found',
            })
            return
        }

        // TODO: Send email notification to host about payout approval

        logger.info(`Payout ${payoutId} approved by admin`)
        res.status(200).json({
            success: true,
            message: 'Payout approved successfully',
            payout,
        })
        return
    } catch (error) {
        logger.error('Error approving payout:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to approve payout',
            message: (error as Error).message,
        })
        return
    }
}

// Reject Payout (Admin)
export const rejectPayout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { payoutId } = req.params
        const { reason } = req.body

        if (!reason) {
            res.status(400).json({
                success: false,
                error: 'Rejection reason is required',
            })
            return
        }

        const payout = await Payout.findByIdAndUpdate(
            payoutId,
            {
                status: 'failed', // Marking as failed/rejected so balance returns (logic needs to handle this)
                // Actually, if we mark as failed, the getEarnings calculation logic excludes failed payouts, so balance is restored to 'available'.
                // Payout Model has 'failed' status.
            },
            { new: true }
        ).populate('hostId', 'name email')

        if (!payout) {
            res.status(404).json({
                success: false,
                error: 'Payout request not found',
            })
            return
        }

        // TODO: Send email notification about rejection

        logger.info(`Payout ${payoutId} rejected by admin. Reason: ${reason}`)
        res.status(200).json({
            success: true,
            message: 'Payout rejected',
            payout,
        })
        return
    } catch (error) {
        logger.error('Error rejecting payout:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to reject payout',
            message: (error as Error).message,
        })
        return
    }
}
