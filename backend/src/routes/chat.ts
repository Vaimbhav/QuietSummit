import { Router } from 'express'
import { handleChat } from '../controllers/chatController'

const router = Router()

// POST /api/v1/chat - Handle chat messages
router.post('/', handleChat)

export default router
