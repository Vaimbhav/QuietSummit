import { Router } from 'express'
import { createSignUp, getAllSignUps } from '../controllers/signUpController'

const router = Router()

router.post('/', createSignUp)
router.get('/', getAllSignUps)

export default router
