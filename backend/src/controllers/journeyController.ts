import { Request, Response } from 'express'
import Journey from '../models/Journey'
import logger from '../utils/logger'

export const getAllJourneys = async (req: Request, res: Response) => {
    try {
        const { difficulty, region, status = 'published', timing } = req.query

        const filter: any = { status }

        if (difficulty) {
            filter.difficulty = difficulty
        }

        if (region) {
            filter['location.region'] = region
        }

        if (timing) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Use 1970 as a safe lower bound to distinguish valid past dates from "empty" low-sorting types like null or {}
            const epoch = new Date('1970-01-01');

            if (timing === 'upcoming') {
                // Include future dates AND missing/null/empty dates (treated as TBD/Upcoming)
                filter.$or = [
                    { departureDate: { $gte: today } },
                    { departureDate: null },
                    { departureDate: { $exists: false } },
                    { departureDate: {} }, // Explicitly check for empty object
                    { departureDate: { $lt: epoch } } // Catches other non-date types
                ]
            } else if (timing === 'past') {
                // Strictly past dates that are valid (greater than epoch)
                filter.departureDate = { $lt: today, $gte: epoch }
            }
        }

        const journeys = await Journey.find(filter).sort({ createdAt: -1 })

        res.json({
            success: true,
            count: journeys.length,
            data: journeys,
        })
    } catch (error) {
        logger.error('Error fetching journeys:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch journeys',
        })
    }
}

export const getJourneyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const journey = await Journey.findById(req.params.id)

        if (!journey) {
            res.status(404).json({
                success: false,
                error: 'Journey not found',
            })
            return
        }

        res.json({
            success: true,
            data: journey,
        })
    } catch (error) {
        logger.error('Error fetching journey:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch journey',
        })
    }
}

export const getJourneyBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const journey = await Journey.findOne({ slug: req.params.slug })

        if (!journey) {
            res.status(404).json({
                success: false,
                error: 'Journey not found',
            })
            return
        }

        res.json({
            success: true,
            data: journey,
        })
    } catch (error) {
        logger.error('Error fetching journey by slug:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to fetch journey',
        })
    }
}

export const createJourney = async (req: Request, res: Response) => {
    try {
        const journey = await Journey.create(req.body)

        res.status(201).json({
            success: true,
            data: journey,
        })
    } catch (error) {
        logger.error('Error creating journey:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to create journey',
        })
    }
}
