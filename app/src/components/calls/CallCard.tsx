import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons, Feather } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { Call } from '../../types/call.types';
import { formatDisplay, formatDuration } from '../../utils/formatPhone';

interface CallCardProps {
  call: Call;
  onCallBack: (number: string) => void;
  onDelete: () => void;
}

const CallCard = ({ call, onCallBack, onDelete }: CallCardProps) => {

  const isMissed = call.status === 'no-answer' || call.status === 'busy';
  const displayNum = call.direction === 'inbound' ? call.fromNumber : call.toNumber;

  const renderRightActions = (progress: Animated.AnimatedInterpolation<string | number>, dragX: Animated.AnimatedInterpolation<string | number>) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        onPress={onDelete}
        activeOpacity={0.8}
        className="w-[80] h-full bg-danger items-center justify-center border-l border-white/5"
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Feather name="trash-2" size={24} color="white" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable 
      renderRightActions={renderRightActions}
      onSwipeableRightOpen={onDelete}
      containerStyle={styles.swipeContainer}
    >
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border/40">
        
        {/* LEFT: Avatar with Badge */}
        <View className="relative">
          <View className="w-11 h-11 rounded-full items-center justify-center bg-surfaceAlt border border-border">
            <Text className="text-textPrimary text-lg font-bold">
              {displayNum.charAt(displayNum.startsWith('+') ? 2 : 0).toUpperCase()}
            </Text>
          </View>
          
          {/* Direction Badge */}
          <View 
            className={`absolute bottom-[-2] right-[-2] w-4 h-4 rounded-full items-center justify-center shadow-sm border border-background ${
              isMissed ? 'bg-danger' : call.direction === 'inbound' ? 'bg-success' : 'bg-primary'
            }`}
          >
            <Ionicons 
              name={
                isMissed ? 'close' : 
                call.direction === 'inbound' ? 'arrow-down-outline' : 'arrow-up-outline'
              } 
              size={8} 
              color="white" 
            />
          </View>
        </View>

        {/* CENTER: Info Body */}
        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row items-center">
            <Text 
              className={`text-[15px] font-bold ${isMissed ? 'text-danger' : 'text-textPrimary'}`}
              numberOfLines={1}
            >
              {formatDisplay(displayNum)}
            </Text>
          </View>
          
          <Text className="text-textSecondary text-[10px] mt-0.5 tracking-widest font-bold uppercase">
            {call.twilioNumber ? `Via ${formatDisplay(call.twilioNumber)}` : 'Via Twilio Line 1'}
          </Text>

          <View className="flex-row items-center mt-1">
            <Text className="text-textMuted text-[12px]">
              {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' • '}
              {isMissed ? 'No answer' : formatDuration(call.duration || 0)}
            </Text>
          </View>
        </View>

        {/* RIGHT: Callback Action */}
        <TouchableOpacity 
          onPress={() => onCallBack(displayNum)}
          className="w-9 h-9 rounded-full bg-surfaceAlt items-center justify-center mr-2 border border-border"
        >
          <Feather name="phone-call" size={16} color={Colors.primary} />
        </TouchableOpacity>

        <Feather name="chevron-right" size={16} color={Colors.textMuted} />
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    backgroundColor: '#0D0F14',
  },
});

export default memo(CallCard);
