import { Router } from 'express'
import * as callController from '../controllers/call.controller'

const router = Router()

/**
 * Access Token for Voice SDK
 */
router.post('/token', callController.getAccessToken)

/**
 * Initiate an outbound call
 */
router.post('/make', callController.makeCall)

/**
 * End an active call
 */
router.post('/end', callController.endCall)

/**
 * Get call details
 */
router.get('/status/:callSid', callController.getCallStatus)

export default router
