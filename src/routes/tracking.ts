import { Router } from 'express'
import { handleOpen, handleClick } from '../controllers/trackingController'


const router = Router()

router.get('/open', handleOpen)
router.get('/click', handleClick)

export default router