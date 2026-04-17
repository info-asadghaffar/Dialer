import { useState, useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';

/**
 * Custom hook to manage VoIP-critical microphone permissions.
 */
export const useMicrophonePermission = () => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    const checkPermission = useCallback(async () => {
        setIsChecking(true);
        try {
            const { status, canAskAgain } = await Audio.getPermissionsAsync();
            setHasPermission(status === 'granted');
        } catch (err) {
            console.error('[Permissions] Error checking status:', err);
        } finally {
            setIsChecking(false);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        try {
            const { status, canAskAgain } = await Audio.requestPermissionsAsync();
            setHasPermission(status === 'granted');

            if (status !== 'granted') {
               Alert.alert(
                 'Microphone Access Required',
                 'NexaDial needs microphone access to place and receive calls. Please enable it in your device settings.',
                 [
                   { text: 'Cancel', style: 'cancel' },
                   { text: 'Open Settings', onPress: () => Linking.openSettings() }
                 ]
               );
            }
            return status === 'granted';
        } catch (err) {
            console.error('[Permissions] Error requesting status:', err);
            return false;
        }
    }, []);

    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    return { 
        hasPermission, 
        requestPermission, 
        isChecking,
        checkPermission
    };
};
