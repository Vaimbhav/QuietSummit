import { Router } from 'express';
import {
    uploadSingleImage,
    uploadMultipleImagesController,
    deleteImageController,
    uploadProfileImageController,
} from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';
import {
    uploadSingle,
    uploadMultiple,
    uploadProfileImage,
} from '../middleware/upload';

const router = Router();

/**
 * @route   POST /api/v1/upload/single
 * @desc    Upload a single image
 * @access  Private
 */
router.post('/single', authenticateToken, uploadSingle, uploadSingleImage);

/**
 * @route   POST /api/v1/upload/multiple
 * @desc    Upload multiple images (max 50)
 * @access  Private
 */
router.post('/multiple', authenticateToken, uploadMultiple, uploadMultipleImagesController);

/**
 * @route   POST /api/v1/upload/profile
 * @desc    Upload profile image
 * @access  Private
 */
router.post('/profile', authenticateToken, uploadProfileImage, uploadProfileImageController);

/**
 * @route   DELETE /api/v1/upload
 * @desc    Delete an image by public ID
 * @access  Private
 */
router.delete('/', authenticateToken, deleteImageController);

export default router;
