import React, { useEffect, useRef, memo } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../constants/colors';
import { useCallStore } from '../store/callStore';
import { formatDisplay } from '../utils/formatPhone';

const { width } = Dimensions.get('window');

/**
 * Pulse Ring Component for Incoming Call
 */
const PulseRing = ({ delay, color }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 2.2,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ])
    ).start();
  }, [delay, scale, opacity]);

  return (
    <Animated.View 
      style={[
        styles.ring, 
        { 
          transform: [{ scale }], 
          opacity, 
          borderColor: color 
        }
      ]} 
    />
  );
};

/**
 * IncomingCallScreen handles receiving Twilio Voice calls.
 */
const IncomingCallScreen = () => {
    const route: any = useRoute();
    const navigation = useNavigation<any>();
    const { callInvite } = route.params || {};

    const { setActiveCall } = useCallStore();

    const handleAccept = async () => {
        try {
            const call = await callInvite.accept();
            
            // 1. Update State Store
            setActiveCall({
              callSid: call.getSid() || 'unknown',
              toNumber: callInvite.to,
              fromNumber: callInvite.from,
              direction: 'inbound',
              status: 'in-progress',
              startTime: new Date(),
              isMuted: false,
              isOnHold: false,
              isSpeakerOn: false
            });

            // 2. Navigate to Active Call Screen
            navigation.navigate('ActiveCall', { 
                toNumber: callInvite.from, 
                direction: 'inbound' 
            });
        } catch (err) {
            console.error('Failed to accept incoming call:', err);
        }
    };

    const handleDecline = async () => {
        try {
            await callInvite.reject();
            navigation.goBack();
        } catch (err) {
            console.error('Failed to decline incoming call:', err);
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 justify-between py-24 px-10">
                
                {/* Center Content: Avatar & Info */}
                <View className="items-center mt-12">
                    <View className="items-center justify-center mb-20">
                        {/* Staggered pulse rings */}
                        <PulseRing delay={0} color={Colors.primary} />
                        <PulseRing delay={400} color={Colors.secondary} />
                        <PulseRing delay={800} color={Colors.primary} />
                        
                        <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-surfaceAlt bg-surface shadow-2xl relative">
                           <LinearGradient
                              colors={[Colors.surface, Colors.surfaceAlt] as string[]}
                              className="w-full h-full items-center justify-center"
                           >
                              <Text className="text-primary text-5xl font-black">
                                {callInvite?.from.charAt(callInvite?.from.startsWith('+') ? 2 : 0).toUpperCase()}
                              </Text>
                           </LinearGradient>
                        </View>
                    </View>

                    <Text className="text-textMuted text-sm font-bold uppercase tracking-[6px] mb-4">
                        Incoming Call
                    </Text>
                    <Text className="text-textPrimary text-4xl font-bold text-center">
                        {formatDisplay(callInvite?.from || 'Unknown')}
                    </Text>
                    <View className="bg-surfaceAlt px-4 py-2 rounded-full mt-6 border border-border">
                       <Text className="text-textSecondary text-xs font-semibold">
                          VIA TWILIO SERVICE LINE
                       </Text>
                    </View>
                </View>

                {/* Bottom Buttons: Decline / Accept */}
                <View className="flex-row justify-between items-center w-full mt-10">
                    {/* Decline */}
                    <View className="items-center">
                        <TouchableOpacity 
                          onPress={handleDecline}
                          className="w-20 h-20 bg-danger/20 rounded-full items-center justify-center border border-danger/30"
                        >
                            <View className="bg-danger w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-danger">
                               <Ionicons name="call-outline" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-danger text-[11px] font-bold uppercase mt-3 tracking-widest">
                          Decline
                        </Text>
                    </View>

                    {/* Accept */}
                    <View className="items-center">
                        <TouchableOpacity 
                          onPress={handleAccept}
                          className="w-20 h-20 bg-success/20 rounded-full items-center justify-center border border-success/30"
                        >
                            <View className="bg-success w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-success">
                               <Ionicons name="call" size={32} color="white" />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-success text-[11px] font-bold uppercase mt-3 tracking-widest">
                          Accept
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    ring: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        zIndex: -1,
    }
});

export default memo(IncomingCallScreen);
