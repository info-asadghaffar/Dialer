import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';
import { getTwilioClient } from '../services/twilioClient';
import { AppError } from '../middleware/errorHandler';

/**
 * Fetch settings with masked AuthToken.
 */
export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { data: settings, error } = await supabase.from('settings').select('*').single();
        if (error || !settings) {
            res.json({ success: true, data: null });
            return;
        }

        // Mask authToken: **** + last4
        const maskedToken = settings.auth_token 
            ? `****${settings.auth_token.slice(-4)}` 
            : '';

        res.json({
            success: true,
            data: { ...settings, auth_token: maskedToken }
        });
    } catch (err) { next(err) }
};

/**
 * Persist Twilio credentials securely.
 */
export const saveSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const body = req.body;

        if (!body.account_sid?.startsWith('AC')) {
            throw new AppError('Account SID must start with AC', 400);
        }
        if (!body.twiml_app_sid?.startsWith('AP')) {
            throw new AppError('TwiML App SID must start with AP', 400);
        }

        const { data, error } = await supabase.from('settings').upsert({
            ...body,
            id: 1, // Single settings row for MVP
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' }).select();

        if (error) throw error;
        res.json({ success: true, data: data[0] });
    } catch (err) { next(err) }
};

/**
 * Validates Twilio credentials by fetching account details.
 */
export const testConnection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let { account_sid, auth_token } = req.body;

        // If not provided in body, try fetching from DB
        if (!account_sid || !auth_token) {
            const { data: settings } = await supabase.from('settings').select('*').single();
            if (settings) {
                account_sid = account_sid || settings.account_sid;
                auth_token = auth_token || settings.auth_token;
            }
        }

        if (!account_sid || !auth_token) {
            throw new AppError('Credentials required for connection test', 400);
        }

        const client = getTwilioClient(account_sid, auth_token);
        const account = await client.api.accounts(account_sid).fetch();

        await supabase.from('settings')
            .update({ is_connected: true, last_verified_at: new Date().toISOString() })
            .eq('id', 1);

        res.json({
            success: true,
            data: { accountName: account.friendlyName }
        });
    } catch (err) {
        next(new AppError((err as any).message || 'Twilio connection failed', 401));
    }
};
