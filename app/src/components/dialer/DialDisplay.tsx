import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatDisplay } from '../../utils/formatPhone';

interface DialDisplayProps {
  number: string;
  onDelete: () => void;
  onClear: () => void;
  contactName?: string | null;
}

const DialDisplay = ({ number, onDelete, onClear, contactName }: DialDisplayProps) => {
  const cursorOpacity = useRef(new Animated.Value(0)).current;
  const numberScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Blinking cursor animation
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [cursorOpacity]);

  // Spring animation on number change
  useEffect(() => {
    if (number.length > 0) {
      numberScale.setValue(0.95);
      Animated.spring(numberScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [number, numberScale]);

  return (
    <View className="w-full items-center justify-center h-28 px-4">
      {/* Contact Name Label */}
      <View className="h-6">
        {contactName ? (
          <Text className="text-primary font-medium text-sm tracking-wide">
            {contactName.toUpperCase()}
          </Text>
        ) : null}
      </View>

      {/* Number Display Area */}
      <View className="flex-row items-center justify-center mt-2 relative w-full">
        <Animated.View style={{ transform: [{ scale: numberScale }] }}>
          <Text 
            style={[styles.displayText, { color: number.length > 0 ? Colors.textPrimary : Colors.textMuted }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {number.length > 0 ? formatDisplay(number) : 'Enter number'}
            {/* Blinking Cursor */}
            <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
          </Text>
        </Animated.View>

        {/* Delete Button */}
        {number.length > 0 && (
          <TouchableOpacity
            className="absolute right-0 p-3"
            onPress={onDelete}
            onLongPress={onClear}
            activeOpacity={0.7}
          >
            <Feather name="delete" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  displayText: {
    fontFamily: 'JetBrainsMono_400Regular', // Ensure this is loaded in app.config.ts / src/app.tsx
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 1,
  },
  cursor: {
    width: 2,
    height: 32,
    backgroundColor: Colors.primary,
    marginLeft: 2,
    transform: [{ translateY: 6 }]
  }
});

export default memo(DialDisplay);
