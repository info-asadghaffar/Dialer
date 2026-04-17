import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';
import { generateAccessToken } from '../services/tokenService';
import { getClientFromDB } from '../services/twilioClient';
import { assertE164 } from '../utils/validate';
import { logger } from '../utils/logger';

/**
 * Access Token for client-side Voice SDK.
 */
export const getAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { data: settings, error } = await supabase.from('settings').select('*').single();
        if (error || !settings) throw new Error('Settings not configured');

        const identity = 'nexadial-user';
        const token = generateAccessToken({
            identity,
            accountSid: settings.account_sid,
            apiKey: settings.api_key,
            apiSecret: settings.api_secret,
            twimlAppSid: settings.twiml_app_sid
        });

        const expiresAt = Date.now() + 3600 * 1000;
        res.json({ success: true, data: { token, identity, expiresAt } });
    } catch (err) { next(err) }
};

/**
 * Initiate an outbound call.
 */
export const makeCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { to, from } = req.body;
        assertE164(to, 'To number');
        assertE164(from, 'From number');

        const client = await getClientFromDB();
        const call = await client.calls.create({
            to,
            from,
            url: `${process.env.WEBHOOK_URL}/webhooks/call/voice`,
            statusCallback: `${process.env.WEBHOOK_URL}/webhooks/call/status`,
            statusCallbackMethod: 'POST',
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
        });

        // Log to DB
        await supabase.from('calls').insert({
            call_sid: call.sid,
            direction: 'outbound',
            status: 'initiated',
            from_number: from,
            to_number: to,
            twilio_number: from
        });

        res.json({ success: true, data: { callSid: call.sid, status: call.status } });
    } catch (err) { next(err) }
};

/**
 * Restfully terminate an active call.
 */
export const endCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { callSid } = req.body;
        if (!callSid) throw new Error('CallSID required');

        const client = await getClientFromDB();
        await client.calls(callSid).update({ status: 'completed' });

        res.json({ success: true, data: { success: true } });
    } catch (err) { next(err) }
};

/**
 * Fetch real-time status of a call from Twilio.
 */
export const getCallStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { callSid } = req.params;
        const client = await getClientFromDB();
        const call = await client.calls(callSid).fetch();

        res.json({ success: true, data: { callSid, status: call.status, duration: call.duration } });
    } catch (err) { next(err) }
};
