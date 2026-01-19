import { Router } from 'express'
import { createContact, getAllContacts } from '../controllers/contactController'
import { validateRequest } from '../middleware/validate'
import { contactFormSchema } from '../validators/schemas'

const router = Router()

router.post('/', validateRequest(contactFormSchema), createContact)
router.get('/', getAllContacts)

export default router
