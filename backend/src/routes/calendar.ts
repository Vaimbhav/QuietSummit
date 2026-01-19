import { Router } from 'express';
import {
    getPropertyCalendar,
    blockDates,
    unblockDates,
    checkAvailability,
    getAvailableDates,
    updateCalendar,
} from '../controllers/calendarController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/calendar/:propertyId
 * @desc    Get property calendar with blocked dates
 * @access  Public
 */
router.get('/:propertyId', getPropertyCalendar);

/**
 * @route   PUT /api/v1/calendar/:propertyId
 * @desc    Update property calendar (availability/pricing)
 * @access  Private (Host only)
 */
router.put('/:propertyId', authenticateToken, updateCalendar);

/**
 * @route   POST /api/v1/calendar/:propertyId/bulk
 * @desc    Bulk update property calendar (availability/pricing)
 * @access  Private (Host only)
 */
router.post('/:propertyId/bulk', authenticateToken, updateCalendar);

/**
 * @route   GET /api/v1/calendar/:propertyId/availability
 * @desc    Check if property is available for specific date range
 * @access  Public
 */
router.get('/:propertyId/availability', checkAvailability);

/**
 * @route   GET /api/v1/calendar/:propertyId/available-dates
 * @desc    Get available dates for next N months
 * @access  Public
 */
router.get('/:propertyId/available-dates', getAvailableDates);

/**
 * @route   POST /api/v1/calendar/:propertyId/block
 * @desc    Block dates on property calendar
 * @access  Private (Host only)
 */
router.post('/:propertyId/block', authenticateToken, blockDates);

/**
 * @route   DELETE /api/v1/calendar/:propertyId/block/:blockId
 * @desc    Unblock dates on property calendar
 * @access  Private (Host only)
 */
router.delete('/:propertyId/block/:blockId', authenticateToken, unblockDates);

export default router;
