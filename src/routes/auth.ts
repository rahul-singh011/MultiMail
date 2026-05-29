
import {Router} from "express";
import { body } from "express-validator";
import {register , login} from '../controllers/authController'

const router = Router()


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new tenant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Zomato
 *               email:
 *                 type: string
 *                 example: zomato@company.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Tenant registered successfully
 *       409:
 *         description: Email already registered
 *       422:
 *         description: Validation failed
 */


router.post('/register', [
    body('name').trim().notEmpty().withMessage("Name is required!"),
    body('email').trim().notEmpty().normalizeEmail().withMessage("Valid email is required!"),
    body('password').isLength({min: 6}).withMessage("Password min 6 required")
], register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: zomato@company.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
] , login)


export default router