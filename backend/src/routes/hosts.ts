import { Router } from 'express'
import {
    registerAsHost,
    updateHostProfile,
    getHostProfile,
    getHostDashboardStats,
    getHostProperties,
    getHostBookings,
} from '../controllers/hostController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @route   POST /api/hosts/register
 * @desc    Register as a host
 * @access  Private (Authenticated users)
 */
router.post('/register', authenticateToken, registerAsHost)

/**
 * @route   PUT /api/hosts/profile
 * @desc    Update host profile
 * @access  Private (Hosts only)
 */
router.put('/profile', authenticateToken, updateHostProfile)

/**
 * @route   GET /api/hosts/dashboard/stats
 * @desc    Get host dashboard statistics
 * @access  Private (Hosts only)
 */
router.get('/dashboard/stats', authenticateToken, getHostDashboardStats)

/**
 * @route   GET /api/hosts/stats
 * @desc    Get host dashboard statistics (alias)
 * @access  Private (Hosts only)
 */
router.get('/stats', authenticateToken, getHostDashboardStats)

/**
 * @route   GET /api/hosts/properties
 * @desc    Get host properties
 * @access  Private (Hosts only)
 */
router.get('/properties', authenticateToken, getHostProperties)

/**
 * @route   GET /api/hosts/bookings
 * @desc    Get host bookings
 * @access  Private (Hosts only)
 */
router.get('/bookings', authenticateToken, getHostBookings)

/**
 * @route   GET /api/hosts/:hostId
 * @desc    Get public host profile
 * @access  Public
 */
router.get('/:hostId', getHostProfile)

export default router
