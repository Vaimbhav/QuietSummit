import dotenv from 'dotenv'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

// Validate required environment variables
const validateEnv = () => {
    const required = [
        'MONGODB_URI',
        'JWT_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
        'GEMINI_API_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
    ]

    if (isProduction) {
        required.push('CORS_ORIGIN', 'GOOGLE_CALLBACK_URL')
    }

    const missing = required.filter((key) => !process.env[key])

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file and ensure all required variables are set.'
        )
    }

    // Validate JWT_SECRET strength in production
    if (isProduction && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long in production')
    }
}

// Run validation
validateEnv()

export const config = {
    env: process.env.NODE_ENV || 'development',
    isProduction,
    isDevelopment: !isProduction,
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: (process.env.CORS_ORIGIN || (isProduction ? '' : 'http://localhost:5173')).replace(/\/$/, ''),
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || (isProduction ? '' : 'http://localhost:5000/api/v1/auth/google/callback'),
    },
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID!,
        keySecret: process.env.RAZORPAY_KEY_SECRET!,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY!,
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        apiSecret: process.env.CLOUDINARY_API_SECRET!,
    },
    email: {
        user: process.env.EMAIL_USER || process.env.SMTP_USER!,
        password: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS!,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        from: process.env.EMAIL_FROM || process.env.SMTP_USER!,
    },
    clientUrl: process.env.CLIENT_URL || (isProduction ? '' : 'http://localhost:5173'),
}
