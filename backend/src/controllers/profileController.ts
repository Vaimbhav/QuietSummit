import { Request, Response } from 'express'
import SignUp from '../models/SignUp'
import Booking from '../models/Booking'
import { Property } from '../models/Property'
import Review from '../models/Review'
import Wishlist from '../models/Wishlist'
import logger from '../utils/logger'

// Helper function to get user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any
    return user?.id || user?._id?.toString()
}

// Get current user's profile
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const user = await SignUp.findById(userId).select('-password -confirmationToken')

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        res.status(200).json({
            success: true,
            profile: user,
        })
        return
    } catch (error) {
        logger.error('Error fetching profile:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile',
            message: (error as Error).message,
        })
        return
    }
}

// Update current user's profile
export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const { name, phone, interests, subscribeToNewsletter, hostProfile, profileImage } = req.body

        // Build update object (only include fields that are provided)
        const updateFields: any = {}
        if (name !== undefined) updateFields.name = name
        if (phone !== undefined) updateFields.phone = phone
        if (interests !== undefined) updateFields.interests = interests
        if (subscribeToNewsletter !== undefined) updateFields.subscribeToNewsletter = subscribeToNewsletter
        if (profileImage !== undefined) updateFields.profileImage = profileImage

        // Update host profile if provided and user is a host
        if (hostProfile) {
            const user = await SignUp.findById(userId)
            if (user?.isHost) {
                if (hostProfile.bio !== undefined) updateFields['hostProfile.bio'] = hostProfile.bio
                if (hostProfile.languages !== undefined)
                    updateFields['hostProfile.languages'] = hostProfile.languages
            }
        }

        const user = await SignUp.findByIdAndUpdate(userId, updateFields, {
            new: true,
            runValidators: true,
        }).select('-password -confirmationToken')

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        logger.info(`Profile updated for user ${userId}`)
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: user,
        })
        return
    } catch (error) {
        logger.error('Error updating profile:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            message: (error as Error).message,
        })
        return
    }
}

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                error: 'Current password and new password are required',
            })
            return
        }

        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                error: 'New password must be at least 8 characters',
            })
            return
        }

        // Get user with password field
        const user = await SignUp.findById(userId).select('+password')

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        // Check if user has password (Google users might not have one)
        if (!user.password) {
            res.status(400).json({
                success: false,
                error: 'Cannot change password for social login accounts',
            })
            return
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword)
        if (!isMatch) {
            res.status(400).json({
                success: false,
                error: 'Current password is incorrect',
            })
            return
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword
        await user.save()

        logger.info(`Password changed for user ${userId}`)
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        })
        return
    } catch (error) {
        logger.error('Error changing password:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to change password',
            message: (error as Error).message,
        })
        return
    }
}

// Update email
export const updateEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const { newEmail, password } = req.body

        if (!newEmail || !password) {
            res.status(400).json({
                success: false,
                error: 'New email and password are required',
            })
            return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newEmail)) {
            res.status(400).json({
                success: false,
                error: 'Invalid email format',
            })
            return
        }

        // Get user with password
        const user = await SignUp.findById(userId).select('+password')

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        // Verify password
        if (user.password) {
            const isMatch = await user.comparePassword(password)
            if (!isMatch) {
                res.status(400).json({
                    success: false,
                    error: 'Password is incorrect',
                })
                return
            }
        }

        // Check if email is already in use
        const existingUser = await SignUp.findOne({ email: newEmail })
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'Email is already in use',
            })
            return
        }

        // Update email
        user.email = newEmail
        user.status = 'pending' // Require re-confirmation
        await user.save()

        logger.info(`Email updated for user ${userId} to ${newEmail}`)
        res.status(200).json({
            success: true,
            message: 'Email updated successfully. Please verify your new email.',
        })
        return
    } catch (error) {
        logger.error('Error updating email:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update email',
            message: (error as Error).message,
        })
        return
    }
}

// Delete account
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const { password, confirmDelete } = req.body

        if (!confirmDelete || confirmDelete !== 'DELETE') {
            res.status(400).json({
                success: false,
                error: 'Please confirm deletion by sending confirmDelete: "DELETE"',
            })
            return
        }

        // Get user with password
        const user = await SignUp.findById(userId).select('+password')

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        // Verify password if user has one
        if (user.password && password) {
            const isMatch = await user.comparePassword(password)
            if (!isMatch) {
                res.status(400).json({
                    success: false,
                    error: 'Password is incorrect',
                })
                return
            }
        }

        // Check for active bookings
        const activeBookings = await Booking.countDocuments({
            memberId: userId,
            bookingStatus: { $in: ['confirmed', 'pending'] },
        })

        if (activeBookings > 0) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete account with active bookings. Please cancel them first.',
            })
            return
        }

        // Delete user data
        await Promise.all([
            SignUp.findByIdAndDelete(userId),
            Wishlist.deleteMany({ memberId: userId }),
            // Note: Keep bookings and reviews for historical purposes
        ])

        logger.info(`Account deleted for user ${userId}`)
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        })
        return
    } catch (error) {
        logger.error('Error deleting account:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to delete account',
            message: (error as Error).message,
        })
        return
    }
}

// Get user's booking history
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit
        const status = req.query.status as string

        const filter: any = {
            $or: [
                { memberId: userId },
                { user: userId }
            ]
        }
        if (status) filter.bookingStatus = status

        const bookings = await Booking.find(filter)
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

// Get user's hosted properties
export const getMyProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const properties = await Property.find({ host: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Property.countDocuments({ host: userId })

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

// Get reviews written by user
export const getMyReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const reviews = await Review.find({ guestId: userId })
            .populate('propertyId', 'title images')
            .populate('hostId', 'name profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Review.countDocuments({ guestId: userId })

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
        logger.error('Error fetching reviews:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews',
            message: (error as Error).message,
        })
        return
    }
}

// Get reviews received by user (as host)
export const getReviewsAboutMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const reviews = await Review.find({ hostId: userId, reviewType: 'host' })
            .populate('guestId', 'name profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Review.countDocuments({ hostId: userId, reviewType: 'host' })

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
        logger.error('Error fetching reviews about user:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews',
            message: (error as Error).message,
        })
        return
    }
}

// Get user statistics
export const getMyStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            })
            return
        }

        const [
            totalBookings,
            completedBookings,
            totalProperties,
            totalReviews,
            averageRatingReceived,
            wishlists,
        ] = await Promise.all([
            Booking.countDocuments({ memberId: userId }),
            Booking.countDocuments({ memberId: userId, bookingStatus: 'completed' }),
            Property.countDocuments({ host: userId }),
            Review.countDocuments({ guestId: userId }),
            Review.aggregate([
                { $match: { hostId: userId, reviewType: 'host' } },
                { $group: { _id: null, avgRating: { $avg: '$rating' } } },
            ]),
            Wishlist.countDocuments({ memberId: userId }),
        ])

        res.status(200).json({
            success: true,
            stats: {
                bookings: {
                    total: totalBookings,
                    completed: completedBookings,
                },
                properties: totalProperties,
                reviews: {
                    given: totalReviews,
                    averageReceived: averageRatingReceived[0]?.avgRating || 0,
                },
                wishlists,
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching user stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            message: (error as Error).message,
        })
        return
    }
}
