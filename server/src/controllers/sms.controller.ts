import { Request, Response, NextFunction } from 'express'
import { supabase } from '../db/supabase'
import { getTwilioClient } from '../services/twilioClient'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Send an SMS message via Twilio and log to Supabase.
 */
export const sendSms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { to, from, body } = req.body;

    // 1. Fetch Twilio credentials from Supabase settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (settingsError || !settings) {
      throw new Error('Failed to fetch Twilio credentials for sending SMS');
    }

    const client = getTwilioClient(settings.account_sid, settings.auth_token);

    // 2. Validate E.164 format (Simple regex for now)
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(to) || !e164Regex.test(from)) {
      throw new Error('To and From numbers must be in E.164 format');
    }

    // 3. Send SMS via Twilio Messaging API
    const message = await client.messages.create({
      to,
      from,
      body,
      statusCallback: `${process.env.WEBHOOK_URL}/webhooks/sms/status`
    });

    // 4. Persist in Database
    const { error: insertError } = await supabase.from('messages').insert([{
      message_sid: message.sid,
      direction: 'outbound',
      status: 'queued',
      from_number: from,
      to_number: to,
      twilio_number: from,
      body: body,
      created_at: new Date().toISOString()
    }]);

    if (insertError) throw insertError;

    res.status(200).json({
      success: true,
      data: {
        messageSid: message.sid,
        status: message.status
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves all SMS conversations grouped by contact.
 * Includes last message and unread status.
 */
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Fetch all unique contact numbers from messages
    // A contact is either from_number or to_number depending on direction
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Client-side grouping for summary (Can be optimized with SQL if dataset is massive)
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const contactNumber = msg.direction === 'inbound' ? msg.from_number : msg.to_number;
      
      if (!conversationsMap.has(contactNumber)) {
        conversationsMap.set(contactNumber, {
          contactNumber,
          lastMessage: msg,
          unreadCount: 0,
          twilioNumber: msg.twilio_number
        });
      }
      
      // Increment unread count if inbound and not read yet (mocking 'is_read' since we don't have it in schema, using status received as fallback for now)
      if (msg.direction === 'inbound' && msg.status === 'received') {
        const conv = conversationsMap.get(contactNumber);
        conv.unreadCount += 1;
      }
    });

    res.status(200).json({
      success: true,
      data: Array.from(conversationsMap.values())
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Fetch all messages for a specific conversation sorted by date.
 */
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { number } = req.params;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`from_number.eq.${number},to_number.eq.${number}`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (err) {
    next(err);
  }
}
