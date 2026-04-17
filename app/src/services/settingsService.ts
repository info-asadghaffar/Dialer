import { get, post } from './api';
import { AppSettings } from '../types/settings.types';

/**
 * Service for retrieving and persisting NexaDial global configuration.
 */
export const settingsService = {
  /**
   * Fetch current global settings from backend Supabase table.
   */
  getSettings: async (): Promise<AppSettings> => {
    return get<AppSettings>('/settings');
  },

  /**
   * Save partial or full settings back to the environment.
   */
  saveSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    return post<AppSettings>('/settings', settings);
  },

  /**
   * Trigger a live Twilio API check to verify credential validity.
   */
  testConnection: async (credentials?: { account_sid: string; auth_token: string }): Promise<{ success: boolean; accountName?: string; error?: string }> => {
    return post<{ success: boolean; accountName?: string; error?: string }>('/settings/test', credentials);
  },
};
