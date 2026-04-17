import React, { memo, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, FlatList, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

const KEYS = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

interface DialKeyProps {
  digit: string;
  letters: string;
  onPress: (key: string) => void;
  onLongPress?: (key: string) => void;
}

const DialKey = ({ digit, letters, onPress, onLongPress }: DialKeyProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  return (
    <Animated.View 
      style={[
        styles.keyContainer, 
        { 
          transform: [{ scale }], 
          borderColor: glow.interpolate({
            inputRange: [0, 1],
            outputRange: [Colors.border, Colors.primary]
          }),
          shadowColor: Colors.primary,
          shadowOpacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }),
          shadowRadius: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
          elevation: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 4] })
        }
      ]}
    >
      <TouchableOpacity
        className="w-[72] h-[72] rounded-full items-center justify-center"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(digit)}
        onLongPress={() => digit === '0' ? onLongPress?.('+') : onPress(digit)}
        activeOpacity={1}
      >
        <Text style={styles.digitText}>{digit}</Text>
        {letters ? <Text className="text-[10px] text-textMuted uppercase">{letters}</Text> : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface DialPadProps {
  onKeyPress: (key: string) => void;
}

const DialPad = ({ onKeyPress }: DialPadProps) => {
  return (
    <FlatList
      data={KEYS}
      numColumns={3}
      renderItem={({ item }) => (
        <DialKey 
          digit={item.digit} 
          letters={item.letters} 
          onPress={onKeyPress} 
          onLongPress={onKeyPress}
        />
      )}
      keyExtractor={(item) => item.digit}
      columnWrapperStyle={styles.row}
      scrollEnabled={false}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 280,
    alignSelf: 'center',
    marginTop: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keyContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    marginHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontFamily: 'DMSans_700Bold', // Corrected font from Inter to DM Sans
    fontSize: 28,
    color: Colors.textPrimary,
  }
});

export default memo(DialPad);
