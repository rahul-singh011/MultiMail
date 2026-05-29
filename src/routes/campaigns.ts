import {Router} from 'express'
import {body} from 'express-validator'
import {requireJWT} from '../middleware/auth'
import { create, list, getOne, update, remove, send} from '../controllers/campaignController'

const router = Router()
router.use(requireJWT)

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, subject, body]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Black Friday Sale
 *               subject:
 *                 type: string
 *                 example: 50% off everything today
 *               body:
 *                 type: string
 *                 example: Click here to shop now
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-01T10:00:00.000Z
 *     responses:
 *       201:
 *         description: Campaign created
 *       422:
 *         description: Validation failed
 */

router.post('/', [
    body('name').trim().notEmpty().withMessage("Campaign name is required."),
    body('subject').trim().notEmpty().withMessage("Email subject is required"),
    body('body').trim().notEmpty().withMessage('Email body is required'),
    body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),

], create)

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: List all campaigns for current tenant
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Campaigns fetched
 */

router.get('/', list)

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get one campaign by ID
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign fetched
 *       404:
 *         description: Campaign not found
 */

router.get('/:id', getOne)

/**
 * @swagger
 * /api/campaigns/{id}:
 *   patch:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Campaign updated
 *       404:
 *         description: Campaign not found
 */

router.patch('/:id', [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
   body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
   body('body').optional().trim().notEmpty().withMessage('Body cannot be empty'),
   body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),
], update)

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign deleted
 *       404:
 *         description: Campaign not found
 */

router.delete('/:id', remove)

/**
 * @swagger
 * /api/campaigns/{id}/send:
 *   post:
 *     summary: Trigger campaign send — pushes all contacts to Bull Queue
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign sending started
 *       400:
 *         description: No pending contacts or already sending
 */

router.post('/:id/send', send)

export default router
