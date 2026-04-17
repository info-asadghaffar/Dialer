import { Router } from 'express'
import * as historyController from '../controllers/history.controller'

const router = Router()

/**
 * Get call history
 */
router.get('/calls', historyController.getCallHistory)

/**
 * Get call by id
 */
router.get('/calls/:id', historyController.getCallById)

/**
 * Delete call from history
 */
router.delete('/calls/:id', historyController.deleteCall)

export default router
