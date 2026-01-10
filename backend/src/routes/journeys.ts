import { Router } from 'express'
import { getAllJourneys, getJourneyBySlug, createJourney } from '../controllers/journeyController'

const router = Router()

router.get('/', getAllJourneys)
router.get('/:slug', getJourneyBySlug)
router.post('/', createJourney)

export default router
