import React, { useEffect, useRef, memo } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface CallTimerProps {
  formatted: string;
  isRunning: boolean;
}

const CallTimer = ({ formatted, isRunning }: CallTimerProps) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRunning) {
      opacity.setValue(1);
      return;
    }

    // Subtle opacity pulse every second
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [isRunning, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text 
        style={styles.timerText}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatted}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timerText: {
    fontFamily: 'JetBrainsMono_400Regular', // Consistently using the requested font
    fontSize: 48,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
});

export default memo(CallTimer);
