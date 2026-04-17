import twilio from 'twilio';
import { supabase } from '../db/supabase';

/**
 * Cache clients to avoid creating new instances per request.
 * Key: accountSid
 */
const clientCache = new Map<string, twilio.Twilio>();

/**
 * Returns a Twilio REST client initialized with provided credentials.
 */
export function getTwilioClient(accountSid: string, authToken: string): twilio.Twilio {
  if (clientCache.has(accountSid)) {
    return clientCache.get(accountSid)!;
  }
  const client = twilio(accountSid, authToken);
  clientCache.set(accountSid, client);
  return client;
}

/**
 * Fetches the active Twilio client from the database settings.
 */
export async function getClientFromDB(): Promise<twilio.Twilio> {
  const { data: settings, error } = await supabase
    .from('settings')
    .select('account_sid, auth_token')
    .single();

  if (error || !settings) {
    throw new Error('Twilio credentials not found in settings table');
  }

  return getTwilioClient(settings.account_sid, settings.auth_token);
}
