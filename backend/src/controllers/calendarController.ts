import { Request, Response } from 'express';
import Calendar from '../models/Calendar';
import { Property } from '../models/Property';
import Booking from '../models/Booking';
import logger from '../utils/logger';

// Helper to extract user ID from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as any;
    return user?.id || user?._id?.toString();
};

/**
 * Get property calendar
 * GET /api/v1/calendar/:propertyId
 */
export const getPropertyCalendar = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate } = req.query;

        let calendar = await Calendar.findOne({ property: propertyId });

        // If no calendar exists, create one
        if (!calendar) {
            calendar = await Calendar.create({
                property: propertyId,
                blockedDates: [],
            });
        }

        // Filter blocked dates by date range if provided
        let blockedDates = calendar.blockedDates;
        let bookings: any[] = [];

        if (startDate && endDate) {
            const start = new Date(startDate as string);
            const end = new Date(endDate as string);

            blockedDates = calendar.blockedDates.filter((block: any) => {
                return (
                    (block.startDate >= start && block.startDate <= end) ||
                    (block.endDate >= start && block.endDate <= end) ||
                    (block.startDate <= start && block.endDate >= end)
                );
            });

            bookings = await Booking.find({
                propertyId: propertyId,
                bookingStatus: { $in: ['confirmed', 'completed'] },
                $or: [
                    { startDate: { $lte: end }, endDate: { $gte: start } }
                ]
            }).populate('memberId', 'name email profileImage');
        }

        res.status(200).json({
            success: true,
            data: {
                property: calendar.property,
                blockedDates,
                bookings,
            },
        });
    } catch (error) {
        logger.error('Error fetching calendar:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch calendar',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Block dates on property calendar
 * POST /api/v1/calendar/:propertyId/block
 */
export const blockDates = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate, reason, note } = req.body;
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Verify property belongs to user
        const property = await Property.findById(propertyId);
        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found',
            });
            return;
        }

        if (property.host.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to modify this calendar',
            });
            return;
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            res.status(400).json({
                success: false,
                message: 'End date must be after start date',
            });
            return;
        }

        if (start < new Date()) {
            res.status(400).json({
                success: false,
                message: 'Cannot block dates in the past',
            });
            return;
        }

        // Find or create calendar
        let calendar = await Calendar.findOne({ property: propertyId });
        if (!calendar) {
            calendar = await Calendar.create({
                property: propertyId,
                blockedDates: [],
            });
        }

        // Add blocked dates
        calendar.blockedDates.push({
            startDate: start,
            endDate: end,
            reason: reason || 'other',
            note,
        });

        await calendar.save();

        res.status(201).json({
            success: true,
            message: 'Dates blocked successfully',
            data: calendar,
        });
    } catch (error) {
        logger.error('Error blocking dates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to block dates',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Unblock dates on property calendar
 * DELETE /api/v1/calendar/:propertyId/block/:blockId
 */
export const unblockDates = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId, blockId } = req.params;
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Verify property belongs to user
        const property = await Property.findById(propertyId);
        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found',
            });
            return;
        }

        if (property.host.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to modify this calendar',
            });
            return;
        }

        const calendar = await Calendar.findOne({ property: propertyId });
        if (!calendar) {
            res.status(404).json({
                success: false,
                message: 'Calendar not found',
            });
            return;
        }

        // Remove the blocked date
        calendar.blockedDates = calendar.blockedDates.filter(
            (block: any) => block._id.toString() !== blockId
        );

        await calendar.save();

        res.status(200).json({
            success: true,
            message: 'Dates unblocked successfully',
            data: calendar,
        });
    } catch (error) {
        logger.error('Error unblocking dates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unblock dates',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Check availability for date range
 * GET /api/v1/calendar/:propertyId/availability
 */
export const checkAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
            });
            return;
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        const calendar = await Calendar.findOne({ property: propertyId });

        if (!calendar) {
            res.status(200).json({
                success: true,
                data: {
                    available: true,
                    message: 'Property is available for the selected dates',
                },
            });
            return;
        }

        // Check if any blocked dates overlap with requested range
        const hasConflict = calendar.blockedDates.some((block: any) => {
            return (
                (block.startDate >= start && block.startDate <= end) ||
                (block.endDate >= start && block.endDate <= end) ||
                (block.startDate <= start && block.endDate >= end)
            );
        });

        res.status(200).json({
            success: true,
            data: {
                available: !hasConflict,
                message: hasConflict
                    ? 'Property is not available for the selected dates'
                    : 'Property is available for the selected dates',
            },
        });
    } catch (error) {
        logger.error('Error checking availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check availability',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Get available dates for next N months
 * GET /api/v1/calendar/:propertyId/available-dates
 */
export const getAvailableDates = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params;
        const { months = 3 } = req.query;

        const calendar = await Calendar.findOne({ property: propertyId });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + parseInt(months as string));

        const blockedDates = calendar
            ? calendar.blockedDates.filter((block: any) => {
                return block.endDate >= startDate && block.startDate <= endDate;
            })
            : [];

        res.status(200).json({
            success: true,
            data: {
                startDate,
                endDate,
                blockedDates,
                totalBlockedDays: blockedDates.reduce((acc: number, block: any) => {
                    const days = Math.ceil(
                        (block.endDate.getTime() - block.startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return acc + days;
                }, 0),
            },
        });
    } catch (error) {
        logger.error('Error fetching available dates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available dates',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Update calendar availability and pricing
 * PUT /api/v1/calendar/:propertyId
 */
export const updateCalendar = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId } = req.params;
        const { date, available } = req.body;
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Verify property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found',
            });
            return;
        }

        // Verify property belongs to user
        if (property.host.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to modify this calendar',
            });
            return;
        }

        let calendar = await Calendar.findOne({ property: propertyId });
        if (!calendar) {
            calendar = await Calendar.create({
                property: propertyId,
                blockedDates: [],
            });
        }

        const targetDate = new Date(date);

        // Remove any existing blocks that overlap with this date
        // Note: This logic assumes single-day updates for now as per frontend call
        // A complex logic would be needed to split multi-day blocks if a day in middle is freed
        // For MVP simplicity: we just add a block if available=false, 
        // and remove blocks if available=true (but splitting blocks is hard, so we just filter out strict matches for now or add new block)

        if (!available) {
            // Treat as blocking for one day
            // Check if already blocked to avoid duplicates
            const isAlreadyBlocked = calendar.blockedDates.some((block: any) =>
                targetDate >= block.startDate && targetDate <= block.endDate
            );

            if (!isAlreadyBlocked) {
                calendar.blockedDates.push({
                    startDate: targetDate,
                    endDate: targetDate,
                    reason: 'other',
                });
            }
        } else {
            // Make available: remove any blocks that strictly match this date (or are single day blocks for this date)
            // Realistically to unblock a day in a range, we'd need to split the range. 
            // This simplifed version only supports unblocking if the date matches start/end of a block or is a single day block.
            // For MVP: we will just filter out blocks that are exactly this date.
            calendar.blockedDates = calendar.blockedDates.filter((block: any) =>
                !(block.startDate.getTime() === targetDate.getTime() && block.endDate.getTime() === targetDate.getTime())
            );
        }

        await calendar.save();

        res.status(200).json({
            success: true,
            message: 'Calendar updated successfully',
            data: calendar,
        });

    } catch (error) {
        logger.error('Error updating calendar:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update calendar',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

