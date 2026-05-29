import {Router} from 'express'
import {body} from 'express-validator'
import {requireJWT} from '../middleware/auth'
import { create, list, getOne, update, remove, send} from '../controllers/campaignController'

const router = Router()

router.use(requireJWT)

router.post('/', [
    body('name').trim().notEmpty().withMessage("Campaign name is required."),
    body('subject').trim().notEmpty().withMessage("Email subject is required"),
    body('body').trim().notEmpty().withMessage('Email body is required'),
    body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),

], create)
router.get('/', list)
router.get('/:id', getOne)

router.patch('/:id', [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
   body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
   body('body').optional().trim().notEmpty().withMessage('Body cannot be empty'),
   body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),
], update)

router.delete('/:id', remove)

router.post('/:id/send', send)

export default router
