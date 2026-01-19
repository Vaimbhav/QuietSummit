import { Request, Response } from 'express'
import Review from '../models/Review'
import Booking from '../models/Booking'
import { Property } from '../models/Property'
import SignUp from '../models/SignUp'
import logger from '../utils/logger'

// Helper function to get user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any
    return user?.id || user?._id?.toString()
}

// Create a review for property or host
export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const guestId = getUserId(req)
        if (!guestId) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const { bookingId, propertyId, hostId, rating, comment, reviewType, aspects } = req.body

        // Validate required fields
        if (!bookingId || !rating || !comment || !reviewType) {
            res.status(400).json({ message: 'Missing required fields' })
            return
        }

        if (reviewType !== 'property' && reviewType !== 'host') {
            res.status(400).json({ message: 'Invalid review type' })
            return
        }

        if (reviewType === 'property' && !propertyId) {
            res.status(400).json({ message: 'Property ID required for property review' })
            return
        }

        if (reviewType === 'host' && !hostId) {
            res.status(400).json({ message: 'Host ID required for host review' })
            return
        }

        // Check if booking exists and belongs to the user
        const booking = await Booking.findById(bookingId)
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' })
            return
        }

        if (booking.memberId.toString() !== guestId) {
            res.status(403).json({ message: 'Not authorized to review this booking' })
            return
        }

        // Check if booking is completed
        if (booking.bookingStatus !== 'completed') {
            res.status(400).json({ message: 'Can only review completed bookings' })
            return
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ bookingId, reviewType })
        if (existingReview) {
            res.status(400).json({ message: `${reviewType} review already exists for this booking` })
            return
        }

        // Get guest name
        const guest = await SignUp.findById(guestId)
        if (!guest) {
            res.status(404).json({ message: 'Guest not found' })
            return
        }

        // Create review
        const review = new Review({
            propertyId: reviewType === 'property' ? propertyId : undefined,
            hostId: reviewType === 'host' ? hostId : undefined,
            guestId,
            guestName: guest.name,
            bookingId,
            rating,
            comment,
            reviewType,
            aspects,
        })

        await review.save()

        // Update property or host average rating
        if (reviewType === 'property' && propertyId) {
            await updatePropertyRating(propertyId)
        } else if (reviewType === 'host' && hostId) {
            await updateHostRating(hostId)
        }

        logger.info(`Review created: ${review._id} by user ${guestId}`)
        res.status(201).json({ message: 'Review created successfully', review })
        return
    } catch (error) {
        logger.error('Error creating review:', error)
        res.status(500).json({ message: 'Failed to create review', error: (error as Error).message })
        return
    }
}

// Get reviews for a property
export const getPropertyReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const reviews = await Review.find({ propertyId, reviewType: 'property', isReported: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v')

        const total = await Review.countDocuments({ propertyId, reviewType: 'property', isReported: false })

        const property = await Property.findById(propertyId).select('reviews')

        res.status(200).json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            summary: {
                averageRating: property?.reviews?.averageRating || 0,
                totalReviews: property?.reviews?.totalReviews || 0,
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching property reviews:', error)
        res.status(500).json({ message: 'Failed to fetch reviews', error: (error as Error).message })
        return
    }
}

// Get reviews for a host
export const getHostReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hostId } = req.params
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const reviews = await Review.find({ hostId, reviewType: 'host', isReported: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v')

        const total = await Review.countDocuments({ hostId, reviewType: 'host', isReported: false })

        // Calculate average rating
        const stats = await Review.aggregate([
            { $match: { hostId: hostId, reviewType: 'host', isReported: false } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ])

        res.status(200).json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            summary: {
                averageRating: stats[0]?.averageRating || 0,
                totalReviews: stats[0]?.totalReviews || 0,
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching host reviews:', error)
        res.status(500).json({ message: 'Failed to fetch reviews', error: (error as Error).message })
        return
    }
}

// Reply to a review (host only)
export const replyToReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const { reviewId } = req.params
        const { comment } = req.body

        if (!comment) {
            res.status(400).json({ message: 'Reply comment is required' })
            return
        }

        const review = await Review.findById(reviewId)
        if (!review) {
            res.status(404).json({ message: 'Review not found' })
            return
        }

        // Check if user is the host of the property/host being reviewed
        let isAuthorized = false
        if (review.reviewType === 'property' && review.propertyId) {
            const property = await Property.findById(review.propertyId)
            if (property && property.host.toString() === userId) {
                isAuthorized = true
            }
        } else if (review.reviewType === 'host' && review.hostId) {
            if (review.hostId.toString() === userId) {
                isAuthorized = true
            }
        }

        if (!isAuthorized) {
            res.status(403).json({ message: 'Not authorized to reply to this review' })
            return
        }

        // Check if reply already exists
        if (review.hostReply) {
            res.status(400).json({ message: 'Reply already exists for this review' })
            return
        }

        review.hostReply = {
            comment,
            repliedAt: new Date(),
        }

        await review.save()

        logger.info(`Reply added to review ${reviewId} by user ${userId}`)
        res.status(200).json({ message: 'Reply added successfully', review })
        return
    } catch (error) {
        logger.error('Error replying to review:', error)
        res.status(500).json({ message: 'Failed to add reply', error: (error as Error).message })
        return
    }
}

// Report a review
export const reportReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const { reviewId } = req.params
        const { reason } = req.body

        if (!reason) {
            res.status(400).json({ message: 'Report reason is required' })
            return
        }

        const review = await Review.findById(reviewId)
        if (!review) {
            res.status(404).json({ message: 'Review not found' })
            return
        }

        if (review.isReported) {
            res.status(400).json({ message: 'Review already reported' })
            return
        }

        review.isReported = true
        review.reportReason = reason
        review.reportedAt = new Date()

        await review.save()

        logger.info(`Review ${reviewId} reported by user ${userId}`)
        res.status(200).json({ message: 'Review reported successfully' })
        return
    } catch (error) {
        logger.error('Error reporting review:', error)
        res.status(500).json({ message: 'Failed to report review', error: (error as Error).message })
        return
    }
}

// Get user's own reviews
export const getMyReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const reviews = await Review.find({ guestId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('propertyId', 'title images')
            .populate('hostId', 'name profileImage')
            .select('-__v')

        const total = await Review.countDocuments({ guestId: userId })

        res.status(200).json({
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
        logger.error('Error fetching user reviews:', error)
        res.status(500).json({ message: 'Failed to fetch reviews', error: (error as Error).message })
        return
    }
}

// Helper function to update property rating
async function updatePropertyRating(propertyId: string): Promise<void> {
    try {
        const stats = await Review.aggregate([
            { $match: { propertyId: propertyId, reviewType: 'property', isReported: false } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ])

        if (stats.length > 0) {
            await Property.findByIdAndUpdate(propertyId, {
                'reviews.averageRating': Math.round(stats[0].averageRating * 10) / 10,
                'reviews.totalReviews': stats[0].totalReviews,
            })
        }
    } catch (error) {
        logger.error('Error updating property rating:', error)
    }
}

// Helper function to update host rating
async function updateHostRating(hostId: string): Promise<void> {
    try {
        const stats = await Review.aggregate([
            { $match: { hostId: hostId, reviewType: 'host', isReported: false } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    avgCommunication: { $avg: '$aspects.communication' },
                },
            },
        ])

        if (stats.length > 0) {
            await SignUp.findByIdAndUpdate(hostId, {
                'hostProfile.responseRate': Math.round((stats[0].avgCommunication || 5) * 20), // Convert 1-5 to 0-100
            })
        }
    } catch (error) {
        logger.error('Error updating host rating:', error)
    }
}
