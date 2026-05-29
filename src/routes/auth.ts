
import {Router} from "express";
import { body } from "express-validator";
import {register , login} from '../controllers/authController'

const router = Router()

router.post('/register', [
    body('name').trim().notEmpty().withMessage("Name is required!"),
    body('email').trim().notEmpty().normalizeEmail().withMessage("Valid email is required!"),
    body('password').isLength({min: 6}).withMessage("Password min 6 required")
], register)

router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
] , login)


export default router