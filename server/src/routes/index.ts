import { Router, Request, Response, NextFunction } from 'express';
import * as callController from '../controllers/call.controller';
import * as smsController from '../controllers/sms.controller';
import * as historyController from '../controllers/history.controller';
import * as settingsController from '../controllers/settings.controller';
import { validateTwilioWebhook } from '../middleware/validateTwilio';
import { voiceHandler, statusHandler, recordingHandler } from '../webhooks/callWebhook';
import { smsInboundHandler, smsStatusHandler } from '../webhooks/smsWebhook';

const router = Router();

/**
 * VOICE API
 */
router.post('/call/token', callController.getAccessToken);
router.post('/call/make', callController.makeCall);
router.post('/call/end', callController.endCall);
router.get('/call/status/:callSid', callController.getCallStatus);

/**
 * SMS API
 */
router.post('/sms/send', smsController.sendSms);
router.get('/sms/conversations', smsController.getConversations);
router.get('/sms/messages/:number', smsController.getMessages);

/**
 * DATA & HISTORY
 */
router.get('/history/calls', historyController.getCallHistory);
router.delete('/history/calls/:id', historyController.deleteCall);

/**
 * SETTINGS & CONFIG
 */
router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.saveSettings);
router.post('/settings/test', settingsController.testConnection);

/**
 * WEBHOOKS (Usually on separate top-level route, but we can export as group)
 * These are called by Twilio.
 */
export const webhookRouter = Router();
webhookRouter.post('/call/voice', validateTwilioWebhook, voiceHandler);
webhookRouter.post('/call/status', statusHandler);
webhookRouter.post('/call/recording', recordingHandler);
webhookRouter.post('/sms/incoming', validateTwilioWebhook, smsInboundHandler);
webhookRouter.post('/sms/status', smsStatusHandler);

export default router;
