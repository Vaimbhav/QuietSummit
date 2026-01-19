import multer from 'multer';
import { Request } from 'express';

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
});

// Export different upload configurations
export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 50); // Max 50 images
export const uploadProfileImage = upload.single('profileImage');

export default upload;
