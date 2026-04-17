import React, { useEffect, useRef, memo } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Animated, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface CallButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const CallButton = ({ onPress, disabled, isLoading }: CallButtonProps) => {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled || isLoading) {
      pulse1.setValue(1);
      opacity1.setValue(0);
      pulse2.setValue(1);
      opacity2.setValue(0);
      return;
    }

    const animateRing = (pulse: Animated.Value, opacity: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(pulse, {
              toValue: 2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    const anim1 = animateRing(pulse1, opacity1, 0);
    const anim2 = animateRing(pulse2, opacity2, 600);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [disabled, isLoading, pulse1, opacity1, pulse2, opacity2]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View className="items-center justify-center relative">
      {/* Pulse Rings */}
      <Animated.View 
        style={[
          styles.ring, 
          { 
            transform: [{ scale: pulse1 }], 
            opacity: opacity1,
            backgroundColor: Colors.primary 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.ring, 
          { 
            transform: [{ scale: pulse2 }], 
            opacity: opacity2,
            backgroundColor: Colors.primary 
          }
        ]} 
      />

      {/* Button Body */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isLoading}
          className={`w-[72px] h-[72px] rounded-full overflow-hidden items-center justify-center ${disabled ? 'opacity-40' : ''}`}
        >
          <LinearGradient
            colors={Colors.callButton as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0 items-center justify-center w-full h-full"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Feather name="phone" size={28} color="white" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    zIndex: -1,
  },
});

export default memo(CallButton);
