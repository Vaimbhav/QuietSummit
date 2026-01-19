import { Request, Response } from 'express';
import {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploadProfileImage,
} from '../services/cloudinaryService';
import logger from '../utils/logger';

/**
 * Upload single image
 */
export const uploadSingleImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
            return;
        }

        const folder = req.body.folder || 'quietsummit/properties';
        const result = await uploadImage(req.file.buffer, { folder });

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
                width: result.width,
                height: result.height,
            },
        });
    } catch (error) {
        logger.error('Error in uploadSingleImage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImagesController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                message: 'No image files provided',
            });
            return;
        }

        if (files.length > 50) {
            res.status(400).json({
                success: false,
                message: 'Maximum 50 images allowed',
            });
            return;
        }

        const folder = req.body.folder || 'quietsummit/properties';
        const fileBuffers = files.map((file) => file.buffer);
        const results = await uploadMultipleImages(fileBuffers, { folder });

        res.status(200).json({
            success: true,
            message: `${results.length} images uploaded successfully`,
            data: results.map((result) => ({
                url: result.url,
                publicId: result.publicId,
                width: result.width,
                height: result.height,
            })),
        });
    } catch (error) {
        logger.error('Error in uploadMultipleImagesController:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Delete an image
 */
export const deleteImageController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            res.status(400).json({
                success: false,
                message: 'Public ID is required',
            });
            return;
        }

        await deleteImage(publicId);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
        });
    } catch (error) {
        logger.error('Error in deleteImageController:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Upload profile image
 */
export const uploadProfileImageController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No profile image provided',
            });
            return;
        }

        const result = await uploadProfileImage(req.file.buffer);

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        logger.error('Error in uploadProfileImageController:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile image',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
