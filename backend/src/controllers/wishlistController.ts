import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist';
import { Property } from '../models/Property';
import logger from '../utils/logger';

// Helper to extract user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any;
    return user?.id || user?._id?.toString();
};

/**
 * Create a new wishlist
 * POST /api/v1/wishlists
 */
export const createWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, isPublic } = req.body;
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const wishlist = await Wishlist.create({
            user: userId,
            name: name || 'My Favorites',
            description,
            isPublic: isPublic || false,
            properties: [],
        });

        res.status(201).json({
            success: true,
            message: 'Wishlist created successfully',
            data: wishlist,
        });
    } catch (error) {
        logger.error('Error creating wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create wishlist',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Get all wishlists for current user
 * GET /api/v1/wishlists
 */
export const getUserWishlists = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const wishlists = await Wishlist.find({ user: userId })
            .populate('properties', 'title slug images pricing address status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: wishlists.length,
            data: wishlists,
        });
    } catch (error) {
        logger.error('Error fetching wishlists:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlists',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Get a single wishlist by ID
 * GET /api/v1/wishlists/:id
 */
export const getWishlistById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        const wishlist = await Wishlist.findById(id).populate(
            'properties',
            'title slug images pricing address capacity reviews status'
        );

        if (!wishlist) {
            res.status(404).json({
                success: false,
                message: 'Wishlist not found',
            });
            return;
        }

        // Check if user owns this wishlist or if it's public
        if (wishlist.user.toString() !== userId && !wishlist.isPublic) {
            res.status(403).json({
                success: false,
                message: 'Access denied',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: wishlist,
        });
    } catch (error) {
        logger.error('Error fetching wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlist',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Get wishlist by share token (public)
 * GET /api/v1/wishlists/shared/:token
 */
export const getWishlistByToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        const wishlist = await Wishlist.findOne({
            shareToken: token,
            isPublic: true,
        }).populate(
            'properties',
            'title slug images pricing address capacity reviews status'
        );

        if (!wishlist) {
            res.status(404).json({
                success: false,
                message: 'Wishlist not found or not public',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: wishlist,
        });
    } catch (error) {
        logger.error('Error fetching shared wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlist',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Update wishlist
 * PUT /api/v1/wishlists/:id
 */
export const updateWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, isPublic } = req.body;
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const wishlist = await Wishlist.findById(id);

        if (!wishlist) {
            res.status(404).json({
                success: false,
                message: 'Wishlist not found',
            });
            return;
        }

        // Check ownership
        if (wishlist.user.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'You can only update your own wishlists',
            });
            return;
        }

        // Update fields
        if (name !== undefined) wishlist.name = name;
        if (description !== undefined) wishlist.description = description;
        if (isPublic !== undefined) wishlist.isPublic = isPublic;

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist updated successfully',
            data: wishlist,
        });
    } catch (error) {
        logger.error('Error updating wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update wishlist',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Delete wishlist
 * DELETE /api/v1/wishlists/:id
 */
export const deleteWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const wishlist = await Wishlist.findById(id);

        if (!wishlist) {
            res.status(404).json({
                success: false,
                message: 'Wishlist not found',
            });
            return;
        }

        // Check ownership
        if (wishlist.user.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'You can only delete your own wishlists',
            });
            return;
        }

        await wishlist.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Wishlist deleted successfully',
        });
    } catch (error) {
        logger.error('Error deleting wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete wishlist',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Add property to wishlist
 * POST /api/v1/wishlists/:id/properties/:propertyId
 */
export const addPropertyToWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, propertyId } = req.params;
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found',
            });
            return;
        }

        // Get wishlist
        const wishlist = await Wishlist.findById(id);

        if (!wishlist) {
            res.status(404).json({
                success: false,
                message: 'Wishlist not found',
            });
            return;
        }

        // Check ownership
        if (wishlist.user.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'You can only add to your own wishlists',
            });
            return;
        }

        // Check if property already in wishlist
        if (wishlist.properties.includes(propertyId as any)) {
            res.status(400).json({
                success: false,
                message: 'Property already in wishlist',
            });
            return;
        }

        // Add property
        wishlist.properties.push(propertyId as any);
        await wishlist.save();

        // Increment favorite count on property
        await Property.findByIdAndUpdate(propertyId, {
            $inc: { favoriteCount: 1 },
        });

        res.status(200).json({
            success: true,
            message: 'Property added to wishlist',
            data: wishlist,
        });
    } catch (error) {
        logger.error('Error adding property to wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add property to wishlist',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Remove property from wishlist
 * DELETE /api/v1/wishlists/:id/properties/:propertyId
 */
export const removePropertyFromWishlist = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id, propertyId } = req.params;
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const wishlist = await Wishlist.findById(id);

        if (!wishlist) {
            res.status(404).json({
                success: false,
                message: 'Wishlist not found',
            });
            return;
        }

        // Check ownership
        if (wishlist.user.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'You can only remove from your own wishlists',
            });
            return;
        }

        // Remove property
        wishlist.properties = wishlist.properties.filter(
            (p) => p.toString() !== propertyId
        ) as any;
        await wishlist.save();

        // Decrement favorite count on property
        await Property.findByIdAndUpdate(propertyId, {
            $inc: { favoriteCount: -1 },
        });

        res.status(200).json({
            success: true,
            message: 'Property removed from wishlist',
            data: wishlist,
        });
    } catch (error) {
        logger.error('Error removing property from wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove property from wishlist',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Check if property is in any of user's wishlists
 * GET /api/v1/wishlists/check/:propertyId
 */
export const checkPropertyInWishlists = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { propertyId } = req.params;
        const userId = getUserId(req);

        if (!userId) {
            res.status(200).json({
                success: true,
                data: {
                    isFavorited: false,
                    wishlists: [],
                },
            });
            return;
        }

        const wishlists = await Wishlist.find({
            user: userId,
            properties: propertyId,
        }).select('_id name');

        res.status(200).json({
            success: true,
            data: {
                isFavorited: wishlists.length > 0,
                wishlists: wishlists,
            },
        });
    } catch (error) {
        logger.error('Error checking property in wishlists:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check wishlist status',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
