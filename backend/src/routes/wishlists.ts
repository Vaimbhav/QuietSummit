import { Router } from 'express';
import {
    createWishlist,
    getUserWishlists,
    getWishlistById,
    getWishlistByToken,
    updateWishlist,
    deleteWishlist,
    addPropertyToWishlist,
    removePropertyFromWishlist,
    checkPropertyInWishlists,
} from '../controllers/wishlistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/v1/wishlists
 * @desc    Create a new wishlist
 * @access  Private
 */
router.post('/', authenticateToken, createWishlist);

/**
 * @route   GET /api/v1/wishlists
 * @desc    Get all wishlists for current user
 * @access  Private
 */
router.get('/', authenticateToken, getUserWishlists);

/**
 * @route   GET /api/v1/wishlists/check/:propertyId
 * @desc    Check if property is in user's wishlists
 * @access  Private
 */
router.get('/check/:propertyId', authenticateToken, checkPropertyInWishlists);

/**
 * @route   GET /api/v1/wishlists/shared/:token
 * @desc    Get public wishlist by share token
 * @access  Public
 */
router.get('/shared/:token', getWishlistByToken);

/**
 * @route   GET /api/v1/wishlists/:id
 * @desc    Get a single wishlist
 * @access  Private (owner) or Public (if shared)
 */
router.get('/:id', authenticateToken, getWishlistById);

/**
 * @route   PUT /api/v1/wishlists/:id
 * @desc    Update wishlist
 * @access  Private (owner only)
 */
router.put('/:id', authenticateToken, updateWishlist);

/**
 * @route   DELETE /api/v1/wishlists/:id
 * @desc    Delete wishlist
 * @access  Private (owner only)
 */
router.delete('/:id', authenticateToken, deleteWishlist);

/**
 * @route   POST /api/v1/wishlists/:id/properties/:propertyId
 * @desc    Add property to wishlist
 * @access  Private (owner only)
 */
router.post('/:id/properties/:propertyId', authenticateToken, addPropertyToWishlist);

/**
 * @route   DELETE /api/v1/wishlists/:id/properties/:propertyId
 * @desc    Remove property from wishlist
 * @access  Private (owner only)
 */
router.delete(
    '/:id/properties/:propertyId',
    authenticateToken,
    removePropertyFromWishlist
);

export default router;
