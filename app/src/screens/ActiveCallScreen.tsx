import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

import { Colors } from '../constants/colors';
import { useCallStore } from '../store/callStore';
import { useTwilioDevice } from '../hooks/useTwilioDevice';
import { useCallTimer } from '../hooks/useCallTimer';
import { formatDisplay } from '../utils/formatPhone';
import { post } from '../services/api';

import CallTimer from '../components/calls/CallTimer';
import CallControls from '../components/calls/CallControls';

const { width, height } = Dimensions.get('window');

/**
 * ActiveCallScreen for ongoing calls.
 */
const ActiveCallScreen = () => {
    const route: any = useRoute();
    const navigation = useNavigation<any>();
    const { toNumber, direction } = route.params || { toNumber: 'Unknown', direction: 'outbound' };

    const { 
        activeCall, 
        toggleMute, 
        toggleSpeaker, 
        toggleHold, 
        clearActiveCall 
    } = useCallStore();
    
    const { endCall, mute, sendDigits } = useTwilioDevice();
    const { formatted, start, stop, seconds } = useCallTimer();
    
    const [isRecording, setIsRecording] = useState(false);
    
    // Animation for gradient blob
    const hueAnim = useRef(new Animated.Value(0)).current;

    /**
     * Start animations and timer on mount
     */
    useEffect(() => {
        Animated.loop(
            Animated.timing(hueAnim, {
                toValue: 1,
                duration: 8000,
                useNativeDriver: true,
            })
        ).start();

        if (activeCall?.status === 'in-progress' || activeCall?.status === 'ringing') {
          start();
        }

        return () => {
            stop();
        };
    }, [activeCall?.status, hueAnim, start, stop]);

    const handleEndCall = useCallback(async () => {
        try {
            endCall();
            stop();
            
            // 1. Save to History via backend
            await post('/history/calls', {
                call_sid: activeCall?.callSid || 'unknown',
                toNumber: activeCall?.toNumber || toNumber,
                direction,
                duration: seconds,
                status: 'completed',
                started_at: activeCall?.startTime?.toISOString() || new Date().toISOString()
            });

            // 2. Clear state and navigate back
            clearActiveCall();
            navigation.navigate('Main');
        } catch (err) {
            console.error('Failed to end call properly:', err);
            // Fallback: forcefully clear state and navigate back
            clearActiveCall();
            navigation.navigate('Main');
        }
    }, [activeCall, direction, endCall, navigation, seconds, stop, toNumber, clearActiveCall]);

    const toggleH = () => { toggleHold(); };
    const toggleM = () => { 
      const newState = !activeCall?.isMuted;
      mute(newState); 
      toggleMute(); 
    };

    // Interpolate animated color
    const blob1Translate = hueAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 30, 0]
    });

    const blob2Translate = hueAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, -30, 0]
    });

    return (
        <SafeAreaView className="flex-1 bg-background relative" style={styles.safeArea}>
            {/* Background Animated Blobs */}
            <View style={StyleSheet.absoluteFill} className="overflow-hidden">
                <Animated.View 
                    style={[
                        styles.blob, 
                        { backgroundColor: Colors.primary, top: '20%', left: '10%', transform: [{ translateY: blob1Translate }] }
                    ]} 
                />
                <Animated.View 
                    style={[
                        styles.blob, 
                        { backgroundColor: Colors.secondary, bottom: '20%', right: '10%', transform: [{ translateY: blob2Translate }] }
                    ]} 
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(13, 15, 20, 0.85)' }]} />
            </View>

            {/* Content Container */}
            <View className="flex-1 justify-between py-12 px-6">
                
                {/* Top: Status Pill */}
                <View className="items-center mb-10">
                    <View className="bg-surfaceAlt flex-row items-center px-4 py-3 rounded-full border border-border">
                        <View className={`w-3 h-3 rounded-full mr-3 ${activeCall ? 'bg-success' : 'bg-warning'}`} />
                        <Text className="text-textPrimary text-xs font-bold uppercase tracking-widest">
                            {activeCall ? 'Call Connected' : 'Connecting...'}
                        </Text>
                    </View>
                </View>

                {/* Center: Info & Timer */}
                <View className="items-center">
                    <View className="w-24 h-24 mb-6 relative">
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary] as string[]}
                            className="w-full h-full rounded-full items-center justify-center border-2 border-white/10"
                        >
                            <Text className="text-white text-4xl font-black">
                              {toNumber.charAt(toNumber.startsWith('+') ? 2 : 0).toUpperCase()}
                            </Text>
                        </LinearGradient>
                        {activeCall?.isSpeakerOn && (
                          <View className="absolute bottom-[-4] right-[-4] bg-primary rounded-full p-2 border-2 border-background">
                            <Ionicons name="volume-high" size={16} color="white" />
                          </View>
                        )}
                    </View>

                    <Text className="text-textPrimary text-3xl font-bold text-center">
                        {formatDisplay(toNumber)}
                    </Text>
                    <Text className="text-textMuted text-sm font-medium mt-1 tracking-widest uppercase">
                        {direction} · TWILIO LINE 1
                    </Text>

                    <View className="mt-8">
                        <CallTimer formatted={formatted} isRunning={!!activeCall} />
                    </View>
                </View>

                {/* Controls */}
                <CallControls 
                   isMuted={activeCall?.isMuted || false}
                   isSpeakerOn={activeCall?.isSpeakerOn || false}
                   isOnHold={activeCall?.isOnHold || false}
                   isRecording={isRecording}
                   onToggleMute={toggleM}
                   onToggleSpeaker={toggleSpeaker}
                   onToggleHold={toggleH}
                   onToggleRecord={() => setIsRecording(prev => !prev)}
                   onSendDigits={sendDigits}
                />

                {/* Bottom: End Call Button */}
                <View className="items-center mt-10 w-full">
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={handleEndCall}
                      className="w-full h-20"
                    >
                        <LinearGradient
                            colors={Colors.endCallButton as unknown as string[]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="flex-1 rounded-3xl items-center justify-center shadow-lg shadow-danger/30 flex-row"
                        >
                            <View className="bg-white/20 p-3 rounded-full mr-6">
                              <Ionicons 
                                name="call" 
                                size={28} 
                                color="white" 
                                style={{ transform: [{ rotate: '135deg' }] }} 
                              />
                            </View>
                            <Text className="text-white text-xl font-black tracking-widest">END CALL</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#0D0F14'
    },
    blob: {
      position: 'absolute',
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: (width * 0.8) / 2,
      opacity: 0.15,
      filter: 'blur(100px)' // Note: filter not directly in style object without workaround, but can simulate with shadow or opacity
    }
});

export default ActiveCallScreen;
