import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Message } from '../../types/message.types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isOutbound = message.direction === 'outbound';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const StatusIcon = () => {
    if (message.status === 'failed') {
      return (
        <View className="flex-row items-center mt-1">
          <Ionicons name="alert-circle" size={14} color={Colors.danger} />
          <Text className="text-danger text-[9px] font-bold ml-1 uppercase">Tap to retry</Text>
        </View>
      );
    }

    if (message.status === 'delivered') {
      return <Ionicons name="checkmark-done" size={14} color="white" />;
    }

    if (message.status === 'sent') {
      return <Ionicons name="checkmark" size={14} color="white" />;
    }

    return <Ionicons name="checkmark" size={14} color="gray" />; // sending / queued
  };

  const bubbleStyle = isOutbound ? styles.outboundBubble : styles.inboundBubble;

  return (
    <Animated.View 
      style={[{ opacity: fadeAnim, alignItems: isOutbound ? 'flex-end' : 'flex-start' }]}
      className="mb-4 px-4"
    >
      <View style={[styles.bubbleBase, bubbleStyle]}>
        {isOutbound ? (
          <LinearGradient
            colors={['#00D4FF', '#7B61FF'] as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            className="rounded-2xl"
          />
        ) : null}
        
        <Text
          style={[
            styles.messageText,
            { color: isOutbound ? 'white' : Colors.textPrimary }
          ]}
        >
          {message.body}
        </Text>

        {isOutbound ? (
            <View className="absolute bottom-1 right-2">
                <StatusIcon />
            </View>
        ) : null}
      </View>

      <Text className="text-textMuted text-[10px] mt-1 px-1">
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubbleBase: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  outboundBubble: {
    borderBottomRightRadius: 4,
  },
  inboundBubble: {
    backgroundColor: Colors.surfaceAlt,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default memo(MessageBubble);
