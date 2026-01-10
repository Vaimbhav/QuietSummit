import { Router } from 'express'
import { createContact, getAllContacts } from '../controllers/contactController'

const router = Router()

router.post('/', createContact)
router.get('/', getAllContacts)

export default router
