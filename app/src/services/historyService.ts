import { get, del } from './api';
import { Call } from '../types/call.types';

/**
 * Service for call history operations.
 */
export const historyService = {
  /**
   * Fetches call logs with optional filtering and search.
   */
  getCallHistory: async (filter?: string, search?: string): Promise<Call[]> => {
    const params = { filter, search };
    return get<Call[]>('/history/calls', params);
  },

  /**
   * Fetches a single call log by internal ID.
   */
  getCallById: async (id: string): Promise<Call> => {
    return get<Call>(`/history/calls/${id}`);
  },

  /**
   * Deletes a call record permanently.
   */
  deleteCall: async (id: string): Promise<{ success: boolean }> => {
    return del<{ success: boolean }>(`/history/calls/${id}`);
  },
};
