import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';
import { getClientFromDB } from '../services/twilioClient';
import { assertE164 } from '../utils/validate';
import { logger } from '../utils/logger';

/**
 * Handle incoming SMS messages to your Twilio number.
 */
export const smsInboundHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { MessageSid, From, To, Body } = req.body;
        
        // Log to DB
        await supabase.from('messages').insert({
            message_sid: MessageSid,
            direction: 'inbound',
            status: 'received',
            from_number: From,
            to_number: To,
            twilio_number: To,
            body: Body,
            created_at: new Date().toISOString()
        });

        // Respond with empty TwiML
        res.set('Content-Type', 'text/xml');
        res.send('<Response></Response>');
    } catch (err) {
        logger.error('[Webhook] Inbound SMS Error:', err);
        res.sendStatus(200);
    }
};

/**
 * Handle POST /webhooks/sms/status
 * Updates delivery status (sent, delivered, failed).
 */
export const smsStatusHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { MessageSid, MessageStatus } = req.body;

        await supabase.from('messages')
            .update({ status: MessageStatus.toLowerCase() })
            .eq('message_sid', MessageSid);

        res.sendStatus(200);
    } catch (err) {
        logger.error('[Webhook] SMS Status Error:', err);
        res.sendStatus(200);
    }
};
