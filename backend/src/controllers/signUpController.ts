import { Request, Response } from 'express'
import SignUp from '../models/SignUp'
import logger from '../utils/logger'

export const createSignUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, interests, subscribeToNewsletter } = req.body

        // Validate required fields
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                error: 'Name, email, and password are required',
            })
            return
        }

        // Validate password strength
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long',
            })
            return
        }

        const existingSignUp = await SignUp.findOne({ email: email.toLowerCase() })

        if (existingSignUp) {
            res.status(400).json({
                success: false,
                error: 'Email already registered. Please login to your account.',
            })
            return
        }

        const signUp = await SignUp.create({
            name,
            email: email.toLowerCase(),
            password,
            phone,
            interests: interests || [],
            subscribeToNewsletter: subscribeToNewsletter !== false,
            source: 'website',
            status: 'confirmed',
        })

        // Return without password
        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to QuietSummit.',
            data: {
                id: signUp._id,
                name: signUp.name,
                email: signUp.email,
                phone: signUp.phone,
                interests: signUp.interests,
                subscribeToNewsletter: signUp.subscribeToNewsletter,
                memberSince: signUp.createdAt,
            },
        })
    } catch (error) {
        logger.error('Error creating signup:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to process signup',
        })
    }
}

export const getAllSignUps = async (_req: Request, res: Response) => {
    try {
        const signups = await SignUp.find().sort({ createdAt: -1 })

        res.json({
            success: true,
            count: signups.length,
            data: signups,
        })
    } catch (error) {
        logger.error('Error fetching signups:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch signups',
        })
    }
}
