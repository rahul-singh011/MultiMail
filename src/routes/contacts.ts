import { Router } from 'express'
import { body } from 'express-validator'
import { requireJWT } from '../middleware/auth'
import { add, list } from '../controllers/contactController'

const router = Router({mergeParams : true})

router.use(requireJWT)

router.post('/', [
    body('contacts').isArray({min: 1}).withMessage('Contacts must be a non-empty array'),
    body('contacts.*.email').isEmail().withMessage('Each contact must have a valid email'),
    body('contacts.*.firtName').optional().trim(),
    body('contacts.*.lastName').optional().trim()
], add)

router.get('/', list)

export default router