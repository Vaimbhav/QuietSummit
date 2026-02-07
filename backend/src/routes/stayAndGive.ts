import express from 'express'
import {
    submitApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus
} from '../controllers/stayAndGiveController'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = express.Router()

/**
 * @route   POST /api/stay-and-give/applications
 * @desc    Submit a new Stay & Give application
 * @access  Public (optional auth)
 */
router.post('/applications', submitApplication)

/**
 * @route   GET /api/stay-and-give/applications
 * @desc    Get all applications (admin only)
 * @access  Admin
 */
router.get('/applications', authenticateToken, requireAdmin, getAllApplications)

/**
 * @route   GET /api/stay-and-give/applications/:id
 * @desc    Get single application by ID (admin only)
 * @access  Admin
 */
router.get('/applications/:id', authenticateToken, requireAdmin, getApplicationById)

/**
 * @route   PATCH /api/stay-and-give/applications/:id/status
 * @desc    Update application status (admin only)
 * @access  Admin
 */
router.patch('/applications/:id/status', authenticateToken, requireAdmin, updateApplicationStatus)

export default router
