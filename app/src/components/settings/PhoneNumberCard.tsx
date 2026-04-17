import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { TwilioNumber } from '../../types/settings.types';
import { formatDisplay } from '../../utils/formatPhone';

interface PhoneNumberCardProps {
  number: TwilioNumber;
  onDelete: () => void;
  onSetPrimary: () => void;
}

/**
 * Visual card for managing individual Twilio phone numbers.
 */
const PhoneNumberCard = ({ 
  number, 
  onDelete, 
  onSetPrimary 
}: PhoneNumberCardProps) => {

  return (
    <View className="flex-row items-center px-4 py-4 bg-surfaceAlt rounded-2xl border border-border mb-3">
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center border border-primary/30">
        <Feather name="phone" size={18} color={Colors.primary} />
      </View>

      {/* Info Body */}
      <View className="flex-1 ml-4 justify-center">
        <Text className="text-textPrimary text-base font-bold">
          {formatDisplay(number.number)}
        </Text>
        
        <View className="flex-row items-center mt-1">
          {/* Label Badge */}
          <View className="bg-surface/50 border border-border px-2 py-0.5 rounded-sm mr-2">
            <Text className="text-textMuted text-[9px] uppercase font-bold tracking-tighter">
              {number.label || 'Default'}
            </Text>
          </View>
          
          {/* Capability Badges */}
          <View className="flex-row items-center space-x-2">
            <Ionicons name="mic-outline" size={10} color={Colors.success} />
            <Ionicons name="chatbox-outline" size={10} color={Colors.primary} />
          </View>
        </View>
      </View>

      {/* Right Actions */}
      <View className="flex-row items-center">
        {number.isPrimary ? (
          <View className="bg-primary px-3 py-1 rounded-full border border-primary/40 mr-3">
            <Text className="text-background text-[10px] font-black uppercase tracking-widest">
              Primary
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={onSetPrimary}
            className="px-3 py-1 bg-surfaceAlt border border-primary/40 rounded-full mr-3"
          >
            <Text className="text-primary text-[10px] font-black uppercase tracking-widest">
              Set Primary
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
           onPress={onDelete}
           className="p-1"
        >
          <Feather name="trash-2" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(PhoneNumberCard);
