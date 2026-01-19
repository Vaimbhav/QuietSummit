import { Request, Response } from 'express'
import SignUp from '../models/SignUp'
import { Property } from '../models/Property'
import Booking from '../models/Booking'
import logger from '../utils/logger'

// Helper to extract user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any;
    return user?.id || user?._id?.toString();
};

/**
 * Upgrade user to host
 * @route POST /api/hosts/register
 * @access Private (Authenticated users)
 */
export const registerAsHost = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            })
            return;
        }

        const { bio, languages, phone } = req.body

        // Validate required fields
        if (!bio || bio.length < 50) {
            res.status(400).json({
                success: false,
                message: 'Bio must be at least 50 characters',
            })

            return;
        }

        if (!languages || !Array.isArray(languages) || languages.length === 0) {
            res.status(400).json({
                success: false,
                message: 'At least one language is required',
            })

            return;
        }

        // Find user
        const user = await SignUp.findById(userId)

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            })

            return;
        }

        // Check if already a host
        if (user.isHost) {
            res.status(400).json({
                success: false,
                message: 'You are already registered as a host',
            })

            return;
        }

        // Update user to host
        user.isHost = true
        user.role = 'host'
        user.hostProfile = {
            bio,
            languages,
            responseTime: 'within a day',
            responseRate: 100,
            verifications: [],
        }

        // Update phone if provided
        if (phone) {
            user.phone = phone
        }

        await user.save()

        logger.info(`User upgraded to host: ${user.email}`)

        res.json({
            success: true,
            message: 'Successfully registered as a host! You can now create property listings.',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isHost: user.isHost,
                hostProfile: user.hostProfile,
            },
        })
    } catch (error: any) {
        logger.error('Register as host error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to register as host',
            error: error.message,
        })
    }
}

/**
 * Update host profile
 * @route PUT /api/hosts/profile
 * @access Private (Hosts only)
 */
export const updateHostProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            })

            return;
        }

        const user = await SignUp.findById(userId)

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            })

            return;
        }

        if (!user.isHost) {
            res.status(403).json({
                success: false,
                message: 'Only hosts can update host profile',
            })

            return;
        }

        const { bio, languages, profileImage, phone } = req.body

        // Update host profile
        if (bio) user.hostProfile!.bio = bio
        if (languages) user.hostProfile!.languages = languages
        if (profileImage) user.profileImage = profileImage
        if (phone) user.phone = phone

        await user.save()

        logger.info(`Host profile updated: ${user.email}`)

        res.json({
            success: true,
            message: 'Host profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                hostProfile: user.hostProfile,
            },
        })
    } catch (error: any) {
        logger.error('Update host profile error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update host profile',
            error: error.message,
        })
    }
}

/**
 * Get host profile
 * @route GET /api/hosts/:hostId
 * @access Public
 */
export const getHostProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hostId } = req.params

        const host = await SignUp.findOne({ _id: hostId, isHost: true }).select(
            'name email profileImage hostProfile createdAt'
        )

        if (!host) {
            res.status(404).json({
                success: false,
                message: 'Host not found',
            })

            return;
        }

        // Get host's properties count
        const propertiesCount = await Property.countDocuments({
            host: hostId,
            status: 'approved',
            isActive: true,
        })

        res.json({
            success: true,
            data: {
                id: host._id,
                name: host.name,
                email: host.email,
                profileImage: host.profileImage,
                hostProfile: host.hostProfile,
                memberSince: host.createdAt,
                propertiesCount,
            },
        })
    } catch (error: any) {
        logger.error('Get host profile error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch host profile',
            error: error.message,
        })
    }
}

/**
 * Get host dashboard stats
 * @route GET /api/hosts/dashboard/stats
 * @access Private (Hosts only)
 */
export const getHostDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            })

            return;
        }

        const user = await SignUp.findById(userId)

        if (!user || user.role !== 'host') {
            res.status(403).json({
                success: false,
                message: 'Only hosts can access dashboard',
            })

            return;
        }

        // Get property stats
        // Get property stats
        const [
            totalProperties,
            approvedProperties,
            pendingProperties,
            bookingStats,
            revenueStats,
            reviewStats,
            acceptanceRate
        ] = await Promise.all([
            Property.countDocuments({ host: userId }),
            Property.countDocuments({ host: userId, status: 'approved', isActive: true }),
            Property.countDocuments({ host: userId, status: 'pending_review' }),
            // Aggregating bookings for all properties owned by host
            Property.find({ host: userId }).select('_id').then(async (properties) => {
                const propertyIds = properties.map(p => p._id);
                const [total, upcoming, completed] = await Promise.all([
                    Booking.countDocuments({ journeyId: { $in: propertyIds } }),
                    Booking.countDocuments({
                        journeyId: { $in: propertyIds },
                        startDate: { $gte: new Date() },
                        bookingStatus: 'confirmed'
                    }),
                    Booking.countDocuments({
                        journeyId: { $in: propertyIds },
                        endDate: { $lt: new Date() },
                        bookingStatus: 'completed'
                    })
                ]);
                return { total, upcoming, completed };
            }),
            // Aggregating revenue
            Property.find({ host: userId }).select('_id').then(async (properties) => {
                const propertyIds = properties.map(p => p._id);
                const currentMonthStart = new Date();
                currentMonthStart.setDate(1);
                currentMonthStart.setHours(0, 0, 0, 0);

                const [totalRev, monthlyRev] = await Promise.all([
                    Booking.aggregate([
                        {
                            $match: {
                                journeyId: { $in: propertyIds },
                                paymentStatus: 'paid'
                            }
                        },
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                    ]),
                    Booking.aggregate([
                        {
                            $match: {
                                journeyId: { $in: propertyIds },
                                paymentStatus: 'paid',
                                createdAt: { $gte: currentMonthStart }
                            }
                        },
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                    ])
                ]);
                return {
                    total: totalRev[0]?.total || 0,
                    monthly: monthlyRev[0]?.total || 0
                };
            }), // Added comma here
            // Aggregating reviews
            Property.find({ host: userId }).select('_id').then(async (properties) => {
                const propertyIds = properties.map(p => p._id);
                // Dynamically import Review to avoid circular dependency issues if any
                // Assuming Review model exists, else we catch error
                try {
                    const Review = (await import('../models/Review')).default;
                    const stats = await Review.aggregate([
                        { $match: { propertyId: { $in: propertyIds } } },
                        {
                            $group: {
                                _id: null,
                                avgRating: { $avg: '$rating' },
                                count: { $sum: 1 }
                            }
                        }
                    ]);
                    return {
                        avg: stats[0]?.avgRating || 0,
                        count: stats[0]?.count || 0
                    };
                } catch (e) {
                    console.error('Error fetching reviews:', e);
                    return { avg: 0, count: 0 };
                }
            }),
            // Calculating Acceptance Rate
            Property.find({ host: userId }).select('_id').then(async (properties) => {
                const propertyIds = properties.map(p => p._id);
                const [accepted, rejected] = await Promise.all([
                    Booking.countDocuments({ journeyId: { $in: propertyIds }, bookingStatus: 'confirmed' }),
                    Booking.countDocuments({ journeyId: { $in: propertyIds }, bookingStatus: 'rejected' })
                ]);
                const totalDecisions = accepted + rejected;
                return totalDecisions > 0 ? Math.round((accepted / totalDecisions) * 100) : 100;
            })
        ]);

        res.json({
            success: true,
            data: {
                totalProperties: totalProperties,
                activeProperties: approvedProperties,
                pendingProperties: pendingProperties,
                totalBookings: bookingStats.total,
                upcomingBookings: bookingStats.upcoming,
                completedBookings: bookingStats.completed,
                totalRevenue: revenueStats.total,
                monthlyRevenue: revenueStats.monthly,
                averageRating: reviewStats.avg,
                totalReviews: reviewStats.count,
                responseRate: user.hostProfile?.responseRate || 100, // Requires message timestamp tracking
                acceptanceRate: acceptanceRate,
            },
        })
    } catch (error: any) {
        logger.error('Get host dashboard stats error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
            error: error.message,
        })
    }
}

/**
 * Get host properties
 * @route GET /api/hosts/properties
 * @access Private (Hosts only)
 */
export const getHostProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            })
            return;
        }

        const user = await SignUp.findById(userId)

        if (!user || user.role !== 'host') {
            res.status(403).json({
                success: false,
                message: 'Only hosts can access properties',
            })
            return;
        }

        const { status, page = 1, limit = 10 } = req.query
        const skip = (Number(page) - 1) * Number(limit)

        const query: any = { host: userId }
        if (status) {
            query.status = status
        }

        const [properties, total] = await Promise.all([
            Property.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Property.countDocuments(query),
        ])

        res.json({
            success: true,
            data: {
                properties,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        })
    } catch (error: any) {
        logger.error('Get host properties error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties',
            error: error.message,
        })
    }
}

/**
 * Get host bookings
 * @route GET /api/hosts/bookings
 * @access Private (Hosts only)
 */
export const getHostBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            })
            return;
        }

        const user = await SignUp.findById(userId)

        if (!user || user.role !== 'host') {
            res.status(403).json({
                success: false,
                message: 'Only hosts can access bookings',
            })
            return;
        }

        const { status, page = 1, limit = 10 } = req.query
        const skip = (Number(page) - 1) * Number(limit)

        // Find all properties owned by this host
        const properties = await Property.find({ host: userId }).select('_id')
        const propertyIds = properties.map(p => p._id)

        // Create query: Bookings for these properties OR directly assigned to host
        const query: any = {
            $or: [
                { journeyId: { $in: propertyIds } },
                { hostId: userId }
            ]
        }

        if (status) {
            query.bookingStatus = status
        }

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('memberId', 'name email phone profileImage')
                .populate('journeyId', 'title images location') // Populate property details
                .lean(),
            Booking.countDocuments(query)
        ])

        // Transform booking data to match HostBooking interface
        const formattedBookings = bookings.map((booking: any) => {
            const details = booking.journeyId || {};
            const isProperty = booking.journeyModel === 'Property';

            // Normalize image to be an array of objects with url property
            let images: { url: string }[] = [];
            if (details.images && Array.isArray(details.images)) {
                if (details.images.length > 0) {
                    if (typeof details.images[0] === 'string') {
                        images = details.images.map((img: string) => ({ url: img }));
                    } else if (typeof details.images[0] === 'object' && details.images[0].url) {
                        images = details.images; // Already in correct format
                    }
                }
            }

            return {
                _id: booking._id,
                journeyModel: booking.journeyModel || (isProperty ? 'Property' : 'Journey'),
                propertyId: { // Keep name as propertyId for frontend compatibility, but normalized
                    _id: details._id,
                    title: details.title,
                    images: images,
                    location: details.location
                },
                guestId: booking.memberId ? {
                    _id: booking.memberId._id,
                    name: booking.memberId.name,
                    email: booking.memberId.email,
                    phone: booking.memberId.phone,
                    profileImage: booking.memberId.profileImage
                } : null,
                checkIn: booking.startDate || booking.checkIn,
                checkOut: booking.endDate || booking.checkOut,
                guests: booking.numberOfTravelers,
                status: booking.bookingStatus,
                totalPrice: booking.totalAmount,
                createdAt: booking.createdAt
            };
        })

        res.json({
            success: true,
            data: {
                bookings: formattedBookings,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        })

    } catch (error: any) {
        logger.error('Get host bookings error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message,
        })
    }
}

