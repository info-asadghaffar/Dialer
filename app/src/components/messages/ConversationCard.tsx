import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Conversation } from '../../types/message.types';
import { formatDisplay } from '../../utils/formatPhone';

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
  onDelete?: () => void;
}

const ConversationCard = ({ conversation, onPress, onDelete }: ConversationCardProps) => {
  const isUnread = (conversation.unreadCount || 0) > 0;
  const lastMsg = conversation.lastMessage;

  const renderLeftActions = (progress: Animated.Value, dragX: Animated.Value) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        onPress={onDelete}
        activeOpacity={0.8}
        className="w-[80] h-full bg-danger items-center justify-center border-r border-white/5"
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Feather name="trash-2" size={24} color="white" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderLeftActions={renderLeftActions} onSwipeableLeftOpen={onDelete}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center px-4 py-4 bg-surface border-b border-border/40"
      >
        {/* Avatar Area */}
        <View className="relative">
          <LinearGradient
            colors={['#161A22', '#1E2330'] as string[]}
            className="w-12 h-12 rounded-full items-center justify-center border border-border"
          >
            <Text className="text-primary text-lg font-black">
              {conversation.contactNumber.charAt(2).toUpperCase()}
            </Text>
          </LinearGradient>
          
          {isUnread && (
            <View className="absolute top-[-2] right-[-2] w-5 h-5 rounded-full bg-primary items-center justify-center border-2 border-background">
              <Text className="text-background text-[10px] font-black">
                {conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Info Column */}
        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row items-center justify-between">
            <Text 
                className={`text-[15px] ${isUnread ? 'text-textPrimary font-black' : 'text-textSecondary font-bold'}`}
                numberOfLines={1}
            >
              {formatDisplay(conversation.contactNumber)}
            </Text>
            <Text className={`text-[11px] ${isUnread ? 'text-primary' : 'text-textMuted'}`}>
               {new Date(lastMsg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          </View>

          <View className="flex-row items-center mt-1">
            <Text className="text-[10px] text-primary uppercase font-bold tracking-widest mr-2">
              VIA {formatDisplay(conversation.twilioNumber)}
            </Text>
          </View>

          <Text 
            className={`text-sm mt-1 ${isUnread ? 'text-textPrimary font-medium' : 'text-textMuted'}`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lastMsg.body}
          </Text>
        </View>

        <Feather name="chevron-right" size={20} color={Colors.textMuted} className="ml-2" />
      </TouchableOpacity>
    </Swipeable>
  );
};

export default memo(ConversationCard);
