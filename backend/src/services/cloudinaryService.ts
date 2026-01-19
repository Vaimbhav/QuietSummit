import cloudinary from '../config/cloudinary';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/environment';

interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
}

interface UploadOptions {
    folder?: string;
    transformation?: Array<{
        width?: number;
        height?: number;
        crop?: string;
        quality?: string | number;
    }>;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
}

/**
 * Upload a single file to Cloudinary
 */
export const uploadImage = async (
    fileBuffer: Buffer,
    options: UploadOptions = {}
): Promise<UploadResult> => {
    try {
        const defaultOptions = {
            folder: options.folder || 'quietsummit/properties',
            resource_type: options.resource_type || 'image',
            transformation: options.transformation || [
                { width: 1920, height: 1080, crop: 'limit', quality: 'auto:good' },
            ],
        };

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                defaultOptions as any,
                (error: any, result: any) => {
                    if (error) {
                        logger.error('Cloudinary upload error:', error);
                        reject(new Error('Failed to upload image to Cloudinary'));
                    } else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            width: result.width,
                            height: result.height,
                            format: result.format,
                        });
                    }
                }
            );

            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        logger.error('Error in uploadImage to Cloudinary, falling back to local storage:', error);
        // Fallback to local storage
        return uploadToLocal(fileBuffer, options.folder || 'quietsummit/properties');
    }
};

/**
 * Upload to local storage (Fallback)
 */
const uploadToLocal = async (fileBuffer: Buffer, folder: string): Promise<UploadResult> => {
    try {
        // Ensure folder exists
        const uploadDir = path.join(__dirname, '../../uploads', folder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `${uuidv4()}.jpg`; // Defaulting to jpg for simplicity
        const filePath = path.join(uploadDir, filename);

        await fs.promises.writeFile(filePath, fileBuffer);

        // Construct URL
        // Assuming backend serves static files from root/uploads
        // We need the base URL of the backend. 
        // In dev it's localhost:PORT.
        const port = config.port || 5000;
        const baseUrl = `http://localhost:${port}`;
        // relativePath was unused

        // Windows path fix? URLs use forward slashes
        const urlPath = `uploads/${folder}/${filename}`;

        return {
            url: `${baseUrl}/${urlPath}`,
            publicId: urlPath, // Use path as ID for local files
            width: 0,
            height: 0,
            format: 'jpg'
        };
    } catch (localError) {
        logger.error('Local upload failed:', localError);
        throw new Error('Image upload failed (both Cloudinary and Local)');
    }
};

/**
 * Upload multiple files to Cloudinary
 */
export const uploadMultipleImages = async (
    files: Buffer[],
    options: UploadOptions = {}
): Promise<UploadResult[]> => {
    try {
        const uploadPromises = files.map((fileBuffer) =>
            uploadImage(fileBuffer, options)
        );
        return await Promise.all(uploadPromises);
    } catch (error) {
        logger.error('Error in uploadMultipleImages:', error);
        throw new Error('Multiple image upload failed');
    }
};

/**
 * Delete a single image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
        logger.info(`Image deleted from Cloudinary: ${publicId}`);
    } catch (error) {
        logger.error('Error deleting image from Cloudinary:', error);
        throw new Error('Failed to delete image');
    }
};

/**
 * Delete multiple images from Cloudinary
 */
export const deleteMultipleImages = async (
    publicIds: string[]
): Promise<void> => {
    try {
        const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
        await Promise.all(deletePromises);
        logger.info(`Deleted ${publicIds.length} images from Cloudinary`);
    } catch (error) {
        logger.error('Error deleting multiple images:', error);
        throw new Error('Failed to delete images');
    }
};

/**
 * Generate a thumbnail URL from Cloudinary public ID
 */
export const generateThumbnail = (
    publicId: string,
    width: number = 400,
    height: number = 300
): string => {
    return cloudinary.url(publicId, {
        width,
        height,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto',
    });
};

/**
 * Upload profile image with specific transformations
 */
export const uploadProfileImage = async (
    fileBuffer: Buffer
): Promise<UploadResult> => {
    return uploadImage(fileBuffer, {
        folder: 'quietsummit/profiles',
        transformation: [
            { width: 500, height: 500, crop: 'fill', quality: 'auto:good' },
        ],
    });
};
