import { get, post } from './api';
import { Conversation, Message } from '../types/message.types';

/**
 * Service for SMS messaging operations via Twilio and Supabase backend.
 */
export const messageService = {
  /**
   * Send an SMS message.
   */
  sendSms: async (payload: { to: string; from: string; body: string }): Promise<{ messageSid: string; status: Message['status'] }> => {
    return post<{ messageSid: string; status: Message['status'] }>('/sms/send', payload);
  },

  /**
   * Fetch all SMS conversations grouped by contact.
   */
  getConversations: async (): Promise<Conversation[]> => {
    return get<Conversation[]>('/sms/conversations');
  },

  /**
   * Fetch full message history for a specific contact number.
   */
  getMessages: async (contactNumber: string): Promise<Message[]> => {
    return get<Message[]>(`/sms/messages/${contactNumber}`);
  },
};
