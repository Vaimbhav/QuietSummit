import { Request, Response } from 'express'
import SignUp from '../models/SignUp'
import Booking from '../models/Booking'
import logger from '../utils/logger'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment'

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

        // Find member with password field included
        const member = await SignUp.findOne({ email: email.toLowerCase() }).select('+password')

        if (!member) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
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

        // Get booking history
        const bookings = await Booking.find({ memberEmail: member.email }).sort({ startDate: -1 })

        // Return member data without password
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
                memberSince: member.createdAt,
                bookings: bookings,
            },
        })
    } catch (error) {
        logger.error('Error logging in member:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to login',
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
        const { email } = req.query

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
        const { email, interests, subscribeToNewsletter } = req.body

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

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            config.jwtSecret
        )

        // Get booking history
        const bookings = await Booking.find({ memberEmail: user.email }).sort({ startDate: -1 })

        // Store user data in a way that frontend can access
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            interests: user.interests,
            subscribeToNewsletter: user.subscribeToNewsletter,
            status: user.status,
            memberSince: user.createdAt,
            bookings: bookings,
            token: token,
        }

        // Redirect to frontend with user data
        const userDataEncoded = encodeURIComponent(JSON.stringify(userData))
        res.redirect(`${config.corsOrigin}/auth/google/success?data=${userDataEncoded}`)
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

