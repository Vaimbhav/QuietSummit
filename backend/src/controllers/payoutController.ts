import { Request, Response } from 'express'
import Payout from '../models/Payout'
import Booking from '../models/Booking'
import { Property } from '../models/Property'
import logger from '../utils/logger'

// Helper to extract user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any;
    return user?.id || user?._id?.toString();
};

/**
 * Get host payouts
 * @route GET /api/payouts
 */
export const getPayouts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const payouts = await Payout.find({ hostId: userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: payouts,
        });
    } catch (error: any) {
        logger.error('Error fetching payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payouts',
            error: error.message,
        });
    }
};

/**
 * Request a payout
 * @route POST /api/payouts
 */
export const requestPayout = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { amount, method, details } = req.body;

        if (!amount || amount <= 0) {
            res.status(400).json({ success: false, message: 'Invalid payout amount' });
            return;
        }

        if (!method || !details) {
            res.status(400).json({ success: false, message: 'Payment method and details are required' });
            return;
        }

        // Verify sufficient balance
        // 1. Calculate total earnings
        const properties = await Property.find({ host: userId }).select('_id');
        const propertyIds = properties.map(p => p._id);

        const bookings = await Booking.find({
            journeyId: { $in: propertyIds },
            bookingStatus: 'completed' // Only completed bookings count towards balance
        });

        const totalEarnings = bookings.reduce((sum, booking: any) => sum + (booking.totalAmount || 0), 0);

        // 2. Calculate total payouts (including pending)
        const previousPayouts = await Payout.find({
            hostId: userId,
            status: { $ne: 'failed' }
        });

        const totalPaidOut = previousPayouts.reduce((sum, payout) => sum + payout.amount, 0);

        const availableBalance = totalEarnings - totalPaidOut;

        if (amount > availableBalance) {
            res.status(400).json({
                success: false,
                message: `Insufficient balance. Available: ${availableBalance}`,
            });
            return;
        }

        const payout = await Payout.create({
            hostId: userId,
            amount,
            method,
            details,
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Payout requested successfully',
            data: payout,
        });

    } catch (error: any) {
        logger.error('Error requesting payout:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to request payout',
            error: error.message,
        });
    }
};

/**
 * Get earnings summary
 * @route GET /api/payouts/earnings
 */
export const getEarnings = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        // 1. Find properties
        const properties = await Property.find({ host: userId }).select('_id');
        const propertyIds = properties.map(p => p._id);

        // 2. Fetch completed bookings
        const bookings = await Booking.find({
            journeyId: { $in: propertyIds },
            bookingStatus: 'completed'
        });

        const totalEarnings = bookings.reduce((sum, booking: any) => sum + (booking.totalAmount || 0), 0);
        const completedBookingsCount = bookings.length;

        // 3. Fetch payouts
        const payouts = await Payout.find({ hostId: userId });

        const totalWithdrawn = payouts
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingWithdrawal = payouts
            .filter(p => p.status === 'pending' || p.status === 'processing')
            .reduce((sum, p) => sum + p.amount, 0);

        const availableBalance = totalEarnings - (totalWithdrawn + pendingWithdrawal);

        res.json({
            success: true,
            data: {
                totalEarnings,
                totalWithdrawn,
                pendingWithdrawal,
                availableBalance,
                completedBookingsCount,
            },
        });

    } catch (error: any) {
        logger.error('Error fetching earnings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch earnings',
            error: error.message,
        });
    }
};
