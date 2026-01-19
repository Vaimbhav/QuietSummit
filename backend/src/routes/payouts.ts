import { Router } from 'express';
import {
    getPayouts,
    requestPayout,
    getEarnings,
} from '../controllers/payoutController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/payouts
 * @desc    Get all payouts for authenticated host
 * @access  Private (Host)
 */
router.get('/', authenticateToken, getPayouts);

/**
 * @route   POST /api/payouts
 * @desc    Request a new payout
 * @access  Private (Host)
 */
router.post('/', authenticateToken, requestPayout);

/**
 * @route   GET /api/payouts/earnings
 * @desc    Get earnings summary (total, withdrawn, available)
 * @access  Private (Host)
 */
router.get('/earnings', authenticateToken, getEarnings);

export default router;
