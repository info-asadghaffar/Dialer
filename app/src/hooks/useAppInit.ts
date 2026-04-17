import { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { 
  DMSans_400Regular, 
  DMSans_700Bold 
} from '@expo-google-fonts/dm-sans';
import { 
  JetBrainsMono_400Regular 
} from '@expo-google-fonts/jetbrains-mono';

import { useSettingsStore } from '../store/settingsStore';
import { useContactStore } from '../store/contactStore';
import { useMicrophonePermission } from './usePermissions';
import { useTwilioDevice } from './useTwilioDevice';
import { get } from '../services/api';

/**
 * Global App Initialization Hook for boot orchestration.
 */
export const useAppInit = () => {
    const [isReady, setIsReady] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    const { setSettings } = useSettingsStore();
    const { contacts } = useContactStore();
    const { checkPermission } = useMicrophonePermission();
    // const { refreshToken } = useTwilioDevice(); // May require conditional init

    useEffect(() => {
        async function prepareApp() {
            try {
                // 1. Prevent SplashScreen from hiding
                await SplashScreen.preventAutoHideAsync();

                // 2. Load Fonts
                await Font.loadAsync({
                    DMSans_400Regular,
                    DMSans_700Bold,
                    JetBrainsMono_400Regular,
                });

                // 3. Load Remote Settings
                try {
                    const settingsData = await get<any>('/settings');
                    setSettings(settingsData);
                    
                    // 4. Initialize Twilio if credentials exist
                    if (settingsData?.account_sid && settingsData?.auth_token) {
                       // refreshToken(); // Optional: trigger init logic
                    }
                } catch (err) {
                    console.warn('[Init] Settings fetch failed. Using offline mode.');
                }

                // 5. Native hardware checks
                await checkPermission();

            } catch (e: any) {
                setInitError(e.message || 'Error occurred during app boot');
                console.error('[Init] Error:', e);
            } finally {
                setIsReady(true);
            }
        }

        prepareApp();
    }, [setSettings, checkPermission]);

    return { isReady, initError };
};
