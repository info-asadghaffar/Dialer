import { Router } from 'express'
import * as smsController from '../controllers/sms.controller'

const router = Router()

/**
 * Send an SMS message
 */
router.post('/send', smsController.sendSms)

/**
 * Get all conversations
 */
router.get('/conversations', smsController.getConversations)

/**
 * Get message history for a number
 */
router.get('/messages/:number', smsController.getMessages)

export default router
