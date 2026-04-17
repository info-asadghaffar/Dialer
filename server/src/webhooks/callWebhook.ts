import { Request, Response } from 'express';
import { supabase } from '../db/supabase';
import { buildOutboundCallTwiml, buildInboundCallTwiml } from '../services/twimlService';
import { logger } from '../utils/logger';

/**
 * Handle POST /webhooks/call/voice
 * Returns TwiML based on call direction.
 */
export const voiceHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { To, From, Direction, CallSid } = req.body;
        res.set('Content-Type', 'text/xml');

        if (Direction && Direction.toLowerCase().includes('outbound')) {
            // Outbound from app → carrier
            res.send(buildOutboundCallTwiml(To, From));
        } else {
            // Inbound from carrier → app
            res.send(buildInboundCallTwiml('nexadial-user'));
        }
    } catch (err) {
        logger.error('[Webhook] Voice TwiML Error:', err);
        // Fallback to error TwiML if possible
        res.status(500).send('<Response><Say>Internal error in NexaDial service.</Say></Response>');
    }
};

/**
 * Handle POST /webhooks/call/status
 * Synchronizes call status updates with Supabase logs.
 */
export const statusHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { CallSid, CallStatus, CallDuration, From, To } = req.body;

        await supabase.from('calls').upsert({
            call_sid: CallSid,
            status: CallStatus.toLowerCase(),
            duration: parseInt(CallDuration || '0'),
            from_number: From,
            to_number: To,
            ended_at: ['completed', 'failed', 'busy', 'no-answer'].includes(CallStatus) ? new Date().toISOString() : null
        }, { onConflict: 'call_sid' });

        res.sendStatus(200);
    } catch (err) {
        logger.error('[Webhook] Status Callback Error:', err);
        res.sendStatus(200); // Always 200 to prevent Twilio retry loops
    }
};

/**
 * Handle POST /webhooks/call/recording
 */
export const recordingHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { CallSid, RecordingUrl, RecordingDuration, RecordingStatus } = req.body;
        if (RecordingStatus === 'completed') {
            await supabase.from('calls').update({ 
                recording_url: RecordingUrl 
            }).eq('call_sid', CallSid);
        }
        res.sendStatus(200);
    } catch (err) {
        logger.error('[Webhook] Recording Callback Error:', err);
        res.sendStatus(200);
    }
};
