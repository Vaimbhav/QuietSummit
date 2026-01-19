import express from 'express'
import {
    searchProperties,
    getFeaturedProperties,
    getNearbyProperties,
    getLocationSuggestions,
    getFilterOptions,
} from '../controllers/searchController'
import { optionalAuth } from '../middleware/auth'

const router = express.Router()

// All routes are public (optional auth for personalization later)
router.get('/properties', optionalAuth, searchProperties)
router.get('/featured', getFeaturedProperties)
router.get('/nearby', getNearbyProperties)
router.get('/locations', getLocationSuggestions)
router.get('/filters', getFilterOptions)

export default router
