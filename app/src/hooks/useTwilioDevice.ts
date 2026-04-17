import { useEffect, useState, useCallback, useRef } from 'react';
import { Voice, Call } from '@twilio/voice-react-native-sdk';
import { useCallStore } from '../store/callStore';
import { get } from '../services/api';
import * as NavigationService from '../navigation/RootNavigator'; // Assuming we export a ref or use a service

/**
 * Singleton Voice instance as per official Twilio best practices.
 */
const voice = new Voice();

export const useTwilioDevice = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCall, setActiveCallInstance] = useState<Call | null>(null);

  const { setActiveCall, clearActiveCall, updateCallStatus } = useCallStore();
  const tokenRefreshTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * Decodes basic JWT to get expiry (non-sensitive)
   */
  const getExpiryFromToken = (token: string): number => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to ms
    } catch (e) {
      return Date.now() + 3600000; // Fallback 1 hour
    }
  };

  /**
   * Fetches token and registers device
   */
  const initializeDevice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { token } = await get<{ token: string }>('/call/token');
      
      await voice.register(token);
      
      // Schedule token refresh
      const expiry = getExpiryFromToken(token);
      const refreshIn = expiry - Date.now() - 300000; // 5 mins before expiry

      if (tokenRefreshTimeout.current) clearTimeout(tokenRefreshTimeout.current);
      tokenRefreshTimeout.current = setTimeout(initializeDevice, Math.max(0, refreshIn));

    } catch (err: any) {
      setError(err.message || 'Failed to initialize Twilio device');
      console.error('[Twilio] Init Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeDevice();

    const registeredSub = voice.on(Voice.Event.Registered, () => {
      setIsRegistered(true);
      console.log('[Twilio] Device Registered');
    });

    const errorSub = voice.on(Voice.Event.Error, (err) => {
      setError(err.message);
      console.error('[Twilio] Voice Error:', err);
    });

    const callInviteSub = voice.on(Voice.Event.CallInvite, (invite) => {
      console.log('[Twilio] Call Invite from:', invite.from);
      // store in zustand and navigate
      // navigation.navigate('Chat') or specialized screen
    });

    return () => {
      registeredSub.remove();
      errorSub.remove();
      callInviteSub.remove();
      if (tokenRefreshTimeout.current) clearTimeout(tokenRefreshTimeout.current);
    };
  }, [initializeDevice]);

  /**
   * Connects an outbound call
   */
  const makeCall = useCallback(async (to: string) => {
    try {
      setIsLoading(true);
      // To get valid token, we might need a fresh one if current is stale
      const { token } = await get<{ token: string }>('/call/token');
      
      const call = await voice.connect(token, {
        params: { To: to }
      });

      setActiveCallInstance(call);

      call.on(Call.Event.Connected, () => {
        setActiveCall({
          callSid: call.getSid() || 'unknown',
          toNumber: to,
          fromNumber: 'me',
          direction: 'outbound',
          status: 'in-progress',
          startTime: new Date(),
          isMuted: false,
          isOnHold: false,
          isSpeakerOn: false
        });
      });

      call.on(Call.Event.Disconnected, () => {
        clearActiveCall();
        setActiveCallInstance(null);
      });

      call.on(Call.Event.Reconnecting, () => {
        if (call.getSid()) updateCallStatus(call.getSid()!, 'ringing'); // usage of enum mapping
      });

      return call;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setActiveCall, clearActiveCall, updateCallStatus]);

  const endCall = useCallback(() => {
    activeCall?.disconnect();
  }, [activeCall]);

  const mute = useCallback((isMuted: boolean) => {
    activeCall?.mute(isMuted);
  }, [activeCall]);

  const sendDigits = useCallback((digits: string) => {
    activeCall?.sendDigits(digits);
  }, [activeCall]);

  return {
    isRegistered,
    isLoading,
    activeCall,
    error,
    makeCall,
    endCall,
    mute,
    sendDigits,
    refreshToken: initializeDevice
  };
};
