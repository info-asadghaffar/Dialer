import { Router } from 'express'
import * as settingsController from '../controllers/settings.controller'

const router = Router()

/**
 * Get all settings from Supabase
 */
router.get('/', settingsController.getSettings)

/**
 * Save/Update settings
 */
router.post('/', settingsController.saveSettings)

/**
 * Test Twilio connection
 */
router.post('/test', settingsController.testConnection)

export default router
