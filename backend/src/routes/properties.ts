import { Router } from 'express'
import {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertiesByHost,
    searchProperties,
} from '../controllers/propertyController'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = Router()

/**
 * @route   GET /api/properties/search
 * @desc    Search properties with advanced filters
 * @access  Public
 */
router.get('/search', searchProperties) // Public search

/**
 * @route   GET /api/properties/host/:hostId
 * @desc    Get all properties by a specific host
 * @access  Public (shows approved only for others, all for owner)
 */
router.get('/host/:hostId', optionalAuth, getPropertiesByHost)

/**
 * @route   GET /api/properties
 * @desc    Get all approved properties with filters
 * @access  Public
 */
router.get('/', getAllProperties)

/**
 * @route   POST /api/properties
 * @desc    Create a new property listing
 * @access  Private (Authenticated users)
 */
router.post('/', authenticateToken, createProperty)

/**
 * @route   GET /api/properties/:identifier
 * @desc    Get single property by ID or slug
 * @access  Public
 */
router.get('/:identifier', optionalAuth, getPropertyById)

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property (owner only)
 * @access  Private (Property owner)
 */
router.put('/:id', authenticateToken, updateProperty)

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property (owner only)
 * @access  Private (Property owner)
 */
router.delete('/:id', authenticateToken, deleteProperty)

export default router
