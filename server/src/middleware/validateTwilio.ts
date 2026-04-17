import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { logger } from '../utils/logger';

/**
 * Validates Twilio Webhook Signature to ensure request originates from Twilio.
 */
export const validateTwilioWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const twilioSignature = req.headers['x-twilio-signature'] as string;
  const url = (process.env.WEBHOOK_URL || '') + req.originalUrl;
  const params = req.body;

  try {
    const isValid = twilio.validateRequest(authToken, twilioSignature, url, params);

    if (!isValid) {
      logger.warn('[Twilio] Invalid Webhook Signature attempted', { 
        url, 
        signature: twilioSignature 
      });
      res.status(403).json({ success: false, error: 'Invalid Twilio signature' });
      return;
    }
    next();
  } catch (err) {
    logger.error('[Twilio] Signature validation error', err);
    res.status(403).json({ success: false, error: 'Signature validation internal failure' });
  }
};
