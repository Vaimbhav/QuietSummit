import { Request, Response } from 'express'
import { Property } from '../models/Property'
import SignUp from '../models/SignUp'
import logger from '../utils/logger'
import { syncCityToAutocomplete } from '../utils/citySync'
import { Types } from 'mongoose'

// Helper to extract user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any;
    return user?.id || user?._id?.toString();
};

/**
 * Get all properties with filtering, sorting, and pagination
 * @route GET /api/properties
 * @access Public
 */
export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            page = 1,
            limit = 12,
            city,
            country,
            propertyType,
            minPrice,
            maxPrice,
            guests,
            bedrooms,
            bathrooms,
            amenities,
            sort = '-createdAt',
            search, // Add general search param
        } = req.query

        // Build filter query
        const filter: any = {
            status: 'approved',
            isActive: true,
        }

        if (city) filter['address.city'] = new RegExp(city as string, 'i')
        if (country) filter['address.country'] = new RegExp(country as string, 'i')
        if (propertyType) filter.propertyType = propertyType
        if (minPrice || maxPrice) {
            filter['pricing.basePrice'] = {}
            if (minPrice) filter['pricing.basePrice'].$gte = Number(minPrice)
            if (maxPrice) filter['pricing.basePrice'].$lte = Number(maxPrice)
        }
        if (guests) filter['capacity.guests'] = { $gte: Number(guests) }
        if (bedrooms) filter['capacity.bedrooms'] = { $gte: Number(bedrooms) }
        if (bathrooms) filter['capacity.bathrooms'] = { $gte: Number(bathrooms) }
        if (amenities) {
            const amenitiesList = (amenities as string).split(',')
            filter.amenities = { $all: amenitiesList }
        }

        // Generic Text Search (Title, Description, City, Country)
        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { 'address.city': searchRegex },
                { 'address.country': searchRegex },
            ];
        }

        // Pagination
        const pageNum = Math.max(1, Number(page))
        const limitNum = Math.min(50, Math.max(1, Number(limit)))
        const skip = (pageNum - 1) * limitNum

        // Self-Healing: Automatically activate approved but inactive properties
        // This ensures properties appear even if the previous approval logic failed to set isActive
        const inactiveApproved = await Property.countDocuments({ status: 'approved', isActive: false });
        if (inactiveApproved > 0) {
            logger.info(`Self-Healing: Found ${inactiveApproved} approved properties that are inactive. activating them...`);
            await Property.updateMany(
                { status: 'approved', isActive: false },
                { $set: { isActive: true } }
            );
        }

        // Execute query
        const [properties, total] = await Promise.all([
            Property.find(filter)
                .populate('host', 'name email profileImage')
                .sort(sort as string)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Property.countDocuments(filter),
        ])

        res.json({
            success: true,
            data: properties,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        })
    } catch (error: any) {
        logger.error('Get all properties error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties',
            error: error.message,
        })
    }
}

/**
 * Get single property by ID or slug
 * @route GET /api/properties/:identifier
 * @access Public
 */
export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier } = req.params
        const userId = getUserId(req)

        // Check if identifier is ObjectId or slug
        const query = Types.ObjectId.isValid(identifier)
            ? { _id: identifier }
            : { slug: identifier }

        const property = await Property.findOne(query).populate('host', 'name email profileImage createdAt')

        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found',
            })
            return;
        }


        // Self-Healing: If property is approved but inactive, fix it
        if (property.status === 'approved' && !property.isActive) {
            await Property.updateOne({ _id: property._id }, { isActive: true });
            property.isActive = true;
            logger.info(`Self-Healing: Activated property ${property._id} in getPropertyById`);
        }

        // Check visibility logic:
        // Public users can only see approved and active properties
        // Owners and Admins can see properties regardless of status

        let isOwner = false;
        let isAdmin = false;

        try {
            // Check if user is admin - Fetch from DB to be sure since token might not have role
            if (userId) {
                const user = await SignUp.findById(userId);
                if (user && user.role === 'admin') {
                    isAdmin = true;
                    logger.info(`Admin access granted for user: ${user.email}`);
                }
            }

            // Safely check ownership - host might be null if user was deleted
            // property.host might be populated object OR just ID if populate failed
            if (userId && property.host) {
                const hostData: any = property.host;
                const hostId = hostData._id ? hostData._id.toString() : hostData.toString();
                isOwner = hostId === userId;
            }
        } catch (err) {
            logger.error(`Ownership/Admin check failed for property ${property._id}`, err);
            isOwner = false;
        }

        const isPubliclyVisible = property.status === 'approved' && property.isActive;

        if (!isPubliclyVisible && !isOwner && !isAdmin) {
            logger.warn(`Property ${property._id} hidden. Status: ${property.status}, Active: ${property.isActive}, IsOwner: ${isOwner}, IsAdmin: ${isAdmin}`);
            res.status(404).json({
                success: false,
                message: 'Property not found',
            })
            return;
        }

        res.json({
            success: true,
            data: property,
        })
    } catch (error: any) {
        logger.error('Get property error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property',
            error: error.message,
        })
    }
}

/**
 * Create new property (Host only)
 * @route POST /api/properties
 * @access Private (Authenticated users)
 */
export const createProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            })

            return;
        }

        // Validate required fields
        const requiredFields = [
            'title',
            'description',
            'propertyType',
            'address',
            'pricing',
            'capacity',
            'houseRules',
            'images',
        ]

        for (const field of requiredFields) {
            if (!req.body[field]) {
                res.status(400).json({
                    success: false,
                    message: `${field} is required`,
                })
            }
        }

        // Validate images
        if (!req.body.images || req.body.images.length < 3) {
            res.status(400).json({
                success: false,
                message: 'At least 3 images are required',
            })

            return;
        }

        // Ensure at least one primary image
        const hasPrimaryImage = req.body.images.some((img: any) => img.isPrimary)
        if (!hasPrimaryImage) {
            req.body.images[0].isPrimary = true
        }

        // Create property
        const property = await Property.create({
            ...req.body,
            host: userId,
            status: 'pending_review',
        })

        // Auto-sync city to autocomplete database
        if (property.address?.city) {
            await syncCityToAutocomplete(property.address.city, property.address.state);
        }

        logger.info(`Property created: ${property._id} by user: ${userId}`)

        res.status(201).json({
            success: true,
            message: 'Property created successfully and submitted for review',
            data: property,
        })
    } catch (error: any) {
        logger.error('Create property error:', error)

        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map((err: any) => err.message),
            })

            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create property',
            error: error.message,
        })
    }
}

/**
 * Update property (Owner only)
 * @route PUT /api/properties/:id
 * @access Private (Property owner)
 */
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            })

            return;
        }

        const property = await Property.findById(id)

        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found',
            })

            return;
        }

        // Check ownership
        if (property.host.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'You are not authorized to update this property',
            })

            return;
        }

        // If property is approved and major changes are made, reset to pending review
        const majorFields = ['address', 'propertyType', 'capacity']
        const hasMajorChanges = majorFields.some((field) => req.body[field])

        if (property.status === 'approved' && hasMajorChanges) {
            req.body.status = 'pending_review'
        }

        // Update property
        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        )

        // Auto-sync city if address was updated
        if (req.body.address?.city) {
            await syncCityToAutocomplete(req.body.address.city, req.body.address.state);
        }

        logger.info(`Property updated: ${id} by user: ${userId}`)

        res.json({
            success: true,
            message: 'Property updated successfully',
            data: updatedProperty,
        })
    } catch (error: any) {
        logger.error('Update property error:', error)

        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map((err: any) => err.message),
            })

            return;
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update property',
            error: error.message,
        })
    }
}

/**
 * Delete property (Owner only)
 * @route DELETE /api/properties/:id
 * @access Private (Property owner)
 */
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const userId = getUserId(req)

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            })

            return;
        }

        const property = await Property.findById(id)

        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found',
            })

            return;
        }

        // Check ownership
        if (property.host.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this property',
            })

            return;
        }

        // Soft delete - set isActive to false
        await Property.findByIdAndUpdate(id, { isActive: false })

        logger.info(`Property deleted: ${id} by user: ${userId}`)

        res.json({
            success: true,
            message: 'Property deleted successfully',
        })
    } catch (error: any) {
        logger.error('Delete property error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to delete property',
            error: error.message,
        })
    }
}

/**
 * Get properties by host
 * @route GET /api/properties/host/:hostId
 * @access Public
 */
export const getPropertiesByHost = async (req: Request, res: Response) => {
    try {
        const { hostId } = req.params
        const userId = getUserId(req)

        // If viewing own properties, show all statuses
        // If viewing other's properties, only show approved
        const filter: any = { host: hostId }

        if (hostId !== userId) {
            filter.status = 'approved'
            filter.isActive = true
        }

        const properties = await Property.find(filter)
            .sort('-createdAt')
            .lean()

        res.json({
            success: true,
            data: properties,
            count: properties.length,
        })
    } catch (error: any) {
        logger.error('Get properties by host error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties',
            error: error.message,
        })
    }
}

/**
 * Search properties with advanced filters
 * @route GET /api/properties/search
 * @access Public
 */
export const searchProperties = async (req: Request, res: Response) => {
    try {
        const { query, latitude, longitude, radius = 50 } = req.query

        // Self-Healing: Automatically activate approved but inactive properties
        const inactiveApproved = await Property.countDocuments({ status: 'approved', isActive: false });
        if (inactiveApproved > 0) {
            logger.info(`Self-Healing: Found ${inactiveApproved} approved properties that are inactive in search. activating them...`);
            await Property.updateMany(
                { status: 'approved', isActive: false },
                { $set: { isActive: true } }
            );
        }

        const filter: any = {
            status: 'approved',
            isActive: true,
        }

        // Text search
        if (query) {
            filter.$or = [
                { title: new RegExp(query as string, 'i') },
                { description: new RegExp(query as string, 'i') },
                { 'address.city': new RegExp(query as string, 'i') },
                { 'address.country': new RegExp(query as string, 'i') },
            ]
        }

        // Geographic search
        if (latitude && longitude) {
            const lat = Number(latitude)
            const lng = Number(longitude)
            const radiusInKm = Number(radius)

            // Calculate bounding box
            const latRange = radiusInKm / 111 // 1 degree latitude ≈ 111 km
            const lngRange = radiusInKm / (111 * Math.cos((lat * Math.PI) / 180))

            filter['address.coordinates.latitude'] = {
                $gte: lat - latRange,
                $lte: lat + latRange,
            }
            filter['address.coordinates.longitude'] = {
                $gte: lng - lngRange,
                $lte: lng + lngRange,
            }
        }

        const properties = await Property.find(filter)
            .populate('host', 'name email profileImage')
            .sort('-reviews.averageRating')
            .limit(50)
            .lean()

        res.json({
            success: true,
            data: properties,
            count: properties.length,
        })
    } catch (error: any) {
        logger.error('Search properties error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to search properties',
            error: error.message,
        })
    }
}
