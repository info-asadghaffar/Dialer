import { useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import { useMessageStore } from '../store/messageStore';
import { Message } from '../types/message.types';

/**
 * Custom hook to manage SMS logic, polling, and optimistic sending.
 */
export const useMessages = (contactNumber?: string) => {
  const { 
    conversations, 
    setConversations, 
    activeMessages, 
    setActiveMessages, 
    addMessage, 
    updateMessageStatus,
    markAsRead
  } = useMessageStore();

  /**
   * Refresh all conversations (e.g. for Messages screen)
   */
  const refreshConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('[SMS] Refresh Conversations Error:', err);
    }
  }, [setConversations]);

  /**
   * Refresh messages for the active chat
   */
  const refreshMessages = useCallback(async () => {
    if (!contactNumber) return;
    try {
      const data = await messageService.getMessages(contactNumber);
      setActiveMessages(data);
      markAsRead(contactNumber);
    } catch (err) {
      console.error('[SMS] Refresh Messages Error:', err);
    }
  }, [contactNumber, setActiveMessages, markAsRead]);

  /**
   * Polling for real-time updates (8 seconds as requested)
   */
  useEffect(() => {
    refreshConversations();
    const interval = setInterval(refreshConversations, 10000);
    return () => clearInterval(interval);
  }, [refreshConversations]);

  useEffect(() => {
    if (contactNumber) {
      refreshMessages();
      const interval = setInterval(refreshMessages, 8000);
      return () => clearInterval(interval);
    }
  }, [contactNumber, refreshMessages]);

  /**
   * Optimistically send an SMS
   */
  const sendMessage = async (from: string, to: string, body: string) => {
    const tempSid = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempSid,
      messageSid: tempSid,
      direction: 'outbound',
      status: 'sending', // or mapped status 'queued'
      fromNumber: from,
      toNumber: to,
      twilioNumber: from,
      body,
      createdAt: new Date().toISOString(),
    };

    // 1. Optimistic Update
    addMessage(tempMessage);

    try {
      // 2. Transmit via REST API
      const result = await messageService.sendSms({ to, from, body });
      
      // 3. Update with real Twilio SID
      updateMessageStatus(tempSid, result.status);
      // Optional: replace Sid and other props via store action
      refreshMessages(); // Sync back for IDs and sorting
    } catch (err) {
      updateMessageStatus(tempSid, 'failed');
      throw err;
    }
  };

  return {
    conversations,
    messages: activeMessages,
    sendMessage,
    refreshConversations,
    refreshMessages
  };
};
