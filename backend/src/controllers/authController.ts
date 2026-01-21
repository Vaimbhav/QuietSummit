import { Request, Response } from 'express'
import SignUp from '../models/SignUp'
import Booking from '../models/Booking'
import logger from '../utils/logger'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config/environment'
import { sendPasswordResetEmail } from '../services/emailService'

// Login with email and password
export const loginMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required',
            })
            return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                error: 'Invalid email format',
            })
            return
        }

        // Find member with password field included
        const member = await SignUp.findOne({ email: email.toLowerCase() }).select('+password')

        if (!member) {
            // Generic error for security (don't reveal if email exists)
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            })
            return
        }

        // Check if email is verified
        if (member.status !== 'confirmed') {
            res.status(403).json({
                success: false,
                error: 'Please verify your email before logging in',
            })
            return
        }

        // Check if user signed up with Google (no password)
        if (member.googleId && !member.password) {
            res.status(400).json({
                success: false,
                error: 'This account uses Google sign-in. Please use "Continue with Google" instead.',
            })
            return
        }

        // Verify password
        const isPasswordValid = await member.comparePassword(password)

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            })
            return
        }

        // Generate JWT token (expires in 7 days for persistent login)
        const token = jwt.sign(
            {
                id: member._id,
                email: member.email,
                role: member.role || 'member'
            },
            config.jwtSecret,
            { expiresIn: '7d' }
        )

        // Generate refresh token (expires in 30 days)
        const refreshToken = jwt.sign(
            { id: member._id, email: member.email },
            config.jwtSecret + '_refresh',
            { expiresIn: '30d' }
        )

        // Get booking history
        const bookings = await Booking.find({ memberEmail: member.email }).sort({ startDate: -1 })

        // Log login activity
        logger.info(`User logged in: ${member.email}`)

        // Return member data without password but with tokens
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: member._id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                interests: member.interests,
                subscribeToNewsletter: member.subscribeToNewsletter,
                status: member.status,
                role: member.role || 'member',
                isHost: member.isHost || false,
                memberSince: member.createdAt,
                bookings: bookings,
                token: token,
                refreshToken: refreshToken,
            },
        })
    } catch (error) {
        logger.error('Error logging in member:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to login. Please try again later.',
        })
    }
}

// Refresh access token using refresh token
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: oldRefreshToken } = req.body

        if (!oldRefreshToken) {
            res.status(400).json({
                success: false,
                error: 'Refresh token is required',
            })
            return
        }

        // Verify refresh token
        let decoded: any
        try {
            decoded = jwt.verify(oldRefreshToken, config.jwtSecret + '_refresh')
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({
                    success: false,
                    error: 'Refresh token expired. Please login again.',
                    expired: true,
                })
                return
            }
            res.status(401).json({
                success: false,
                error: 'Invalid refresh token',
            })
            return
        }

        // Find the user
        const member = await SignUp.findById(decoded.id)
        if (!member) {
            res.status(401).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        // Generate new tokens
        const newToken = jwt.sign(
            { id: member._id, email: member.email },
            config.jwtSecret,
            { expiresIn: '7d' }
        )

        const newRefreshToken = jwt.sign(
            { id: member._id, email: member.email },
            config.jwtSecret + '_refresh',
            { expiresIn: '30d' }
        )

        logger.info(`Token refreshed for user: ${member.email}`)

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
            },
        })
    } catch (error) {
        logger.error('Error refreshing token:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to refresh token',
        })
    }
}

// Check if email is already a member
export const checkMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.query

        if (!email || typeof email !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Email is required',
            })
            return
        }

        const member = await SignUp.findOne({ email: email.toLowerCase() })

        res.json({
            success: true,
            isMember: !!member,
            data: member
                ? {
                    name: member.name,
                    email: member.email,
                    memberSince: member.createdAt,
                }
                : null,
        })
    } catch (error) {
        logger.error('Error checking member:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to check member status',
        })
    }
}

// Get member profile with booking history
export const getMemberProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // Authenticated user from token
        const userEmail = (req.user as any)?.email

        // Fallback to query if not in protected route (though we just protected it)
        const email = userEmail || req.query.email

        if (!email || typeof email !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Email is required',
            })
            return
        }

        const member = await SignUp.findOne({ email: email.toLowerCase() })

        if (!member) {
            res.status(404).json({
                success: false,
                error: 'Member not found',
            })
            return
        }

        // Get booking history
        const bookings = await Booking.find({ memberEmail: member.email }).sort({ startDate: -1 })

        // Calculate stats
        const completedTrips = bookings.filter(b => b.bookingStatus === 'completed').length
        const upcomingTrips = bookings.filter(b => b.bookingStatus === 'confirmed' && new Date(b.startDate) > new Date()).length
        const totalSpent = bookings
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + b.totalAmount, 0)

        res.json({
            success: true,
            data: {
                id: member._id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                interests: member.interests,
                subscribeToNewsletter: member.subscribeToNewsletter,
                status: member.status,
                memberSince: member.createdAt,
                role: member.role || 'member',
                isHost: member.isHost || false,
                stats: {
                    completedTrips,
                    upcomingTrips,
                    totalSpent,
                },
                bookings,
            },
        })
    } catch (error) {
        logger.error('Error fetching member profile:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile',
        })
    }
}

// Update member preferences
export const updateMemberPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
        const { interests, subscribeToNewsletter } = req.body
        const userEmail = (req.user as any)?.email
        const email = userEmail || req.body.email

        if (!email) {
            res.status(400).json({
                success: false,
                error: 'Email is required',
            })
            return
        }

        const member = await SignUp.findOne({ email: email.toLowerCase() })

        if (!member) {
            res.status(404).json({
                success: false,
                error: 'Member not found',
            })
            return
        }

        // Update preferences
        if (interests !== undefined) {
            member.interests = interests
        }
        if (subscribeToNewsletter !== undefined) {
            member.subscribeToNewsletter = subscribeToNewsletter
        }

        await member.save()

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                id: member._id,
                name: member.name,
                email: member.email,
                interests: member.interests,
                subscribeToNewsletter: member.subscribeToNewsletter,
            },
        })
    } catch (error) {
        logger.error('Error updating member preferences:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences',
        })
    }
}

// Google OAuth callback handler
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        // User is attached by passport
        const user = req.user as any

        if (!user) {
            res.redirect(`${config.corsOrigin}/signup?error=Authentication failed`)
            return
        }

        // Generate JWT token (expires in 7 days for persistent login)
        const token = jwt.sign(
            { id: user._id, email: user.email },
            config.jwtSecret,
            { expiresIn: '7d' }
        )

        // Generate refresh token (expires in 30 days)
        const refreshToken = jwt.sign(
            { id: user._id, email: user.email },
            config.jwtSecret + '_refresh',
            { expiresIn: '30d' }
        )

        // Only pass essential data in URL to avoid length limits
        // Frontend will fetch full profile using the token

        // Check if user is new (created within last 60 seconds)
        const isNewUser = user.createdAt && (Date.now() - new Date(user.createdAt).getTime() < 60000)

        const authData = {
            token,
            refreshToken,
            email: user.email,
            isNewUser: !!isNewUser
        }

        // Redirect to frontend with minimal auth data
        const authDataEncoded = encodeURIComponent(JSON.stringify(authData))
        res.redirect(`${config.corsOrigin}/auth/google/success?data=${authDataEncoded}`)
    } catch (error) {
        logger.error('Error in Google OAuth callback:', error)
        res.redirect(`${config.corsOrigin}/signup?error=Authentication failed`)
    }
}

// Handle Google OAuth error
export const googleError = async (_req: Request, res: Response): Promise<void> => {
    logger.error('Google OAuth error')
    res.redirect(`${config.corsOrigin}/signup?error=Authentication failed`)
}

// Forgot password - request reset link
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body

        if (!email) {
            res.status(400).json({
                success: false,
                error: 'Email is required',
            })
            return
        }

        const member = await SignUp.findOne({ email: email.toLowerCase() })

        // Always return success for security (don't reveal if email exists)
        if (!member) {
            res.json({
                success: true,
                message: 'If the email exists, a password reset link will be sent.',
            })
            return
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

        // Set token expiry to 1 hour
        member.resetPasswordToken = hashedToken
        member.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)
        await member.save()

        // Send reset email
        try {
            await sendPasswordResetEmail(member.email, member.name, resetToken)
            logger.info(`Password reset email sent to: ${member.email}`)
        } catch (emailError) {
            logger.error('Failed to send password reset email:', emailError)
            // Still return success to user for security
        }

        res.json({
            success: true,
            message: 'If the email exists, a password reset link will be sent.',
        })
    } catch (error) {
        logger.error('Error in forgot password:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to process password reset request',
        })
    }
}

// Validate reset token
export const validateResetToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.body

        if (!token) {
            res.status(400).json({
                success: false,
                error: 'Token is required',
            })
            return
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const member = await SignUp.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        })

        if (!member) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired token',
            })
            return
        }

        res.json({
            success: true,
            message: 'Token is valid',
        })
    } catch (error) {
        logger.error('Error validating reset token:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to validate token',
        })
    }
}

// Reset password with token
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password } = req.body

        if (!token || !password) {
            res.status(400).json({
                success: false,
                error: 'Token and password are required',
            })
            return
        }

        if (password.length < 8) {
            res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long',
            })
            return
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const member = await SignUp.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        }).select('+password')

        if (!member) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired token',
            })
            return
        }

        // Update password and clear reset token
        member.password = password
        member.resetPasswordToken = undefined
        member.resetPasswordTokenExpiry = undefined
        await member.save()

        logger.info(`Password reset successful for: ${member.email}`)

        res.json({
            success: true,
            message: 'Password has been reset successfully',
        })
    } catch (error) {
        logger.error('Error resetting password:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to reset password',
        })
    }
}

// Update member role (for onboarding)
export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req.user as any)?.id
        const { isHost } = req.body

        if (typeof isHost !== 'boolean') {
            res.status(400).json({
                success: false,
                error: 'isHost must be a boolean',
            })
            return
        }

        const role = isHost ? 'host' : 'member'

        const user = await SignUp.findByIdAndUpdate(
            userId,
            { isHost, role },
            { new: true }
        )

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            })
            return
        }

        // Generate new token with updated claims
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                isHost: user.isHost
            },
            config.jwtSecret,
            { expiresIn: '7d' }
        )

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                token
            }
        })
    } catch (error) {
        logger.error('Error updating member role:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update role',
        })
    }
}
