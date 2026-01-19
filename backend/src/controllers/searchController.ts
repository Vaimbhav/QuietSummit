import { Request, Response } from 'express'
import { Property } from '../models/Property'
import Calendar from '../models/Calendar'
import IndianCity from '../models/IndianCity'
import logger from '../utils/logger'

// Search properties with advanced filters
export const searchProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 12
        const skip = (page - 1) * limit

        // Build filter object

        // Self-Healing: Automatically activate approved but inactive properties
        // This ensures properties appear even if the previous approval logic failed to set isActive
        const inactiveApproved = await Property.countDocuments({ status: 'approved', isActive: false });
        if (inactiveApproved > 0) {
            logger.info(`Self-Healing: Found ${inactiveApproved} approved properties that are inactive (in searchController). activating them...`);
            await Property.updateMany(
                { status: 'approved', isActive: false },
                { $set: { isActive: true } }
            );
        }

        const filter: any = { status: 'approved', isActive: true }

        // Location filters
        if (req.query.city) {
            filter['address.city'] = { $regex: req.query.city as string, $options: 'i' }
        }
        if (req.query.state) {
            filter['address.state'] = { $regex: req.query.state as string, $options: 'i' }
        }
        if (req.query.country) {
            filter['address.country'] = { $regex: req.query.country as string, $options: 'i' }
        }

        // Search by keyword (title or description)
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search as string, 'i')
            filter.$or = [{ title: searchRegex }, { description: searchRegex }]
        }

        // Property type filter
        if (req.query.propertyType) {
            filter.propertyType = req.query.propertyType
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter['pricing.basePrice'] = {}
            if (req.query.minPrice) {
                filter['pricing.basePrice'].$gte = parseFloat(req.query.minPrice as string)
            }
            if (req.query.maxPrice) {
                filter['pricing.basePrice'].$lte = parseFloat(req.query.maxPrice as string)
            }
        }

        // Capacity filters
        if (req.query.guests) {
            filter['capacity.guests'] = { $gte: parseInt(req.query.guests as string) }
        }
        if (req.query.bedrooms) {
            filter['capacity.bedrooms'] = { $gte: parseInt(req.query.bedrooms as string) }
        }
        if (req.query.bathrooms) {
            filter['capacity.bathrooms'] = { $gte: parseInt(req.query.bathrooms as string) }
        }

        // Amenities filter (must have all specified amenities)
        if (req.query.amenities) {
            const amenitiesArray =
                typeof req.query.amenities === 'string'
                    ? req.query.amenities.split(',')
                    : req.query.amenities
            filter.amenities = { $all: amenitiesArray }
        }

        // House rules filters
        if (req.query.pets === 'true') {
            filter['houseRules.pets'] = true
        }
        if (req.query.smoking === 'true') {
            filter['houseRules.smoking'] = true
        }

        // Instant book filter
        if (req.query.instantBook === 'true') {
            filter['availability.instantBook'] = true
        }

        // Rating filter
        if (req.query.minRating) {
            filter['reviews.averageRating'] = { $gte: parseFloat(req.query.minRating as string) }
        }

        // Build sort object
        let sort: any = {}
        const sortBy = req.query.sortBy as string
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1

        switch (sortBy) {
            case 'price':
                sort['pricing.basePrice'] = sortOrder
                break
            case 'rating':
                sort['reviews.averageRating'] = sortOrder
                break
            case 'reviews':
                sort['reviews.totalReviews'] = sortOrder
                break
            case 'newest':
                sort.createdAt = -1
                break
            case 'popular':
                sort.favoriteCount = -1
                break
            default:
                sort.createdAt = -1
        }

        // Execute query
        const properties = await Property.find(filter)
            .populate('host', 'name email profileImage hostProfile.responseRate')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-__v')

        const total = await Property.countDocuments(filter)

        // If date range is provided, filter out unavailable properties
        let availableProperties = properties
        if (req.query.checkIn && req.query.checkOut) {
            const checkIn = new Date(req.query.checkIn as string)
            const checkOut = new Date(req.query.checkOut as string)

            // Check availability for each property
            const availabilityChecks = await Promise.all(
                properties.map(async (property) => {
                    const calendar = await Calendar.findOne({ property: property._id })
                    if (!calendar) return true // No calendar means available

                    // Check if dates overlap with any blocked dates
                    const hasConflict = calendar.blockedDates.some((blocked) => {
                        return (
                            (checkIn >= blocked.startDate && checkIn < blocked.endDate) ||
                            (checkOut > blocked.startDate && checkOut <= blocked.endDate) ||
                            (checkIn <= blocked.startDate && checkOut >= blocked.endDate)
                        )
                    })

                    return !hasConflict
                })
            )

            availableProperties = properties.filter((_, index) => availabilityChecks[index])
        }

        res.status(200).json({
            success: true,
            properties: availableProperties,
            pagination: {
                page,
                limit,
                total: availableProperties.length,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
            filters: {
                applied: Object.keys(req.query).filter((key) => !['page', 'limit'].includes(key)),
            },
        })
        return
    } catch (error) {
        logger.error('Error searching properties:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to search properties',
            message: (error as Error).message,
        })
        return
    }
}

// Get featured properties (high rating, popular)
export const getFeaturedProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 10

        const properties = await Property.find({
            status: 'approved',
            isActive: true,
            'reviews.averageRating': { $gte: 4.5 },
        })
            .populate('host', 'name profileImage')
            .sort({ 'reviews.averageRating': -1, favoriteCount: -1 })
            .limit(limit)
            .select('-__v')

        res.status(200).json({
            success: true,
            properties,
            count: properties.length,
        })
        return
    } catch (error) {
        logger.error('Error fetching featured properties:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured properties',
            message: (error as Error).message,
        })
        return
    }
}

// Get nearby properties (based on coordinates)
export const getNearbyProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const { latitude, longitude } = req.query
        const radius = parseFloat(req.query.radius as string) || 50 // Default 50km
        const limit = parseInt(req.query.limit as string) || 12

        if (!latitude || !longitude) {
            res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required',
            })
            return
        }

        const lat = parseFloat(latitude as string)
        const lng = parseFloat(longitude as string)

        // Convert radius from km to radians (Earth radius = 6378.1 km)
        const radiusInRadians = radius / 6378.1

        const properties = await Property.find({
            status: 'approved',
            isActive: true,
            'address.coordinates': {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radiusInRadians],
                },
            },
        })
            .populate('host', 'name profileImage')
            .limit(limit)
            .select('-__v')

        res.status(200).json({
            success: true,
            properties,
            count: properties.length,
            center: { latitude: lat, longitude: lng },
            radiusKm: radius,
        })
        return
    } catch (error) {
        logger.error('Error fetching nearby properties:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch nearby properties',
            message: (error as Error).message,
        })
        return
    }
}

// Get location autocomplete suggestions
export const getLocationSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query

        if (!query || (query as string).length < 1) {
            res.status(400).json({
                success: false,
                error: 'Query must be at least 1 character',
            })
            return
        }

        const searchQuery = query as string
        const searchRegex = new RegExp(`^${searchQuery}`, 'i')

        // Search IndianCity collection for matching cities
        const indianCities = await IndianCity.find({
            $or: [{ city: searchRegex }, { state: searchRegex }],
        })
            .limit(20)
            .select('city state type')
            .lean()

        // Get property counts for each city from IndianCity results
        const cityNames = indianCities.map((c) => c.city)
        const propertyCounts = await Property.aggregate([
            {
                $match: {
                    'address.city': { $in: cityNames },
                    status: 'approved',
                    isActive: true,
                },
            },
            {
                $group: {
                    _id: '$address.city',
                    count: { $sum: 1 },
                },
            },
        ])

        // Create a map of city counts
        const countMap = new Map(propertyCounts.map((item) => [item._id, item.count]))

        // Format suggestions with property counts
        const suggestions = indianCities.map((city) => ({
            city: city.city,
            state: city.state,
            type: city.type,
            count: countMap.get(city.city) || 0,
        }))

        // Sort: cities with properties first, then alphabetically
        suggestions.sort((a, b) => {
            if (a.count !== b.count) return b.count - a.count
            return a.city.localeCompare(b.city)
        })

        res.status(200).json({
            success: true,
            suggestions,
            count: suggestions.length,
        })
        return
    } catch (error) {
        logger.error('Error fetching location suggestions:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch location suggestions',
            message: (error as Error).message,
        })
        return
    }
}

// Get filter options (available amenities, property types, etc.)
export const getFilterOptions = async (_req: Request, res: Response): Promise<void> => {
    try {
        // Get unique amenities
        const properties = await Property.find({ status: 'approved', isActive: true }).select(
            'amenities'
        )
        const allAmenities = properties.flatMap((p) => p.amenities)
        const uniqueAmenities = [...new Set(allAmenities)].sort()

        // Property types
        const propertyTypes = ['house', 'apartment', 'villa', 'cottage', 'cabin', 'other']

        // Price range
        const priceStats = await Property.aggregate([
            { $match: { status: 'approved', isActive: true } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$pricing.basePrice' },
                    maxPrice: { $max: '$pricing.basePrice' },
                    avgPrice: { $avg: '$pricing.basePrice' },
                },
            },
        ])

        res.status(200).json({
            success: true,
            filterOptions: {
                amenities: uniqueAmenities,
                propertyTypes,
                priceRange: priceStats[0] || { minPrice: 0, maxPrice: 1000, avgPrice: 200 },
                houseRules: {
                    pets: { label: 'Pets Allowed', value: 'pets' },
                    smoking: { label: 'Smoking Allowed', value: 'smoking' },
                },
                sortOptions: [
                    { label: 'Newest First', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price', order: 'asc' },
                    { label: 'Price: High to Low', value: 'price', order: 'desc' },
                    { label: 'Highest Rated', value: 'rating', order: 'desc' },
                    { label: 'Most Popular', value: 'popular' },
                    { label: 'Most Reviewed', value: 'reviews', order: 'desc' },
                ],
            },
        })
        return
    } catch (error) {
        logger.error('Error fetching filter options:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch filter options',
            message: (error as Error).message,
        })
        return
    }
}
