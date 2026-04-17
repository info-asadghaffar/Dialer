import React, { useState, memo, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Modal, 
  SafeAreaView, 
  StyleSheet, 
  Alert 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import DialPad from '../dialer/DialPad';

interface ControlButtonProps {
  icon: keyof typeof Feather.glyphMap | keyof typeof Ionicons.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
  activeColor: string;
  disabled?: boolean;
  iconSet?: 'feather' | 'ionicons';
}

const ControlButton = ({ 
  icon, 
  label, 
  isActive, 
  onPress, 
  activeColor, 
  disabled,
  iconSet = 'feather'
}: ControlButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) {
      Alert.alert('NexaDial', 'Feature coming soon!');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    
    onPress();
  };

  const IconComponent: any = iconSet === 'feather' ? Feather : Ionicons;

  return (
    <View className="items-center w-[33%] mb-6">
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          disabled={disabled}
          style={[
            styles.button,
            { 
              backgroundColor: isActive ? `${activeColor}33` : Colors.surfaceAlt,
              borderColor: isActive ? activeColor : 'rgba(255,255,255,0.05)',
            }
          ]}
        >
          <IconComponent 
             name={icon} 
             size={22} 
             color={isActive ? activeColor : 'white'} 
          />
        </TouchableOpacity>
      </Animated.View>
      <Text className="text-textMuted text-[11px] font-bold uppercase mt-2 tracking-widest text-center">
        {label}
      </Text>
    </View>
  );
};

interface CallControlsProps {
  isMuted: boolean;
  isSpeakerOn: boolean;
  isOnHold: boolean;
  isRecording: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleHold: () => void;
  onToggleRecord: () => void;
  onSendDigits: (digits: string) => void;
}

const CallControls = ({
  isMuted,
  isSpeakerOn,
  isOnHold,
  isRecording,
  onToggleMute,
  onToggleSpeaker,
  onToggleHold,
  onToggleRecord,
  onSendDigits,
}: CallControlsProps) => {
  const [isKeypadVisible, setKeypadVisible] = useState(false);
  const [dtmfDigits, setDtmfDigits] = useState('');

  const handleKeyPress = (key: string) => {
    setDtmfDigits(prev => prev + key);
    onSendDigits(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View className="w-full px-4 mt-8">
      <View className="flex-row flex-wrap justify-between">
        <ControlButton 
          icon="mic-off" 
          label="Mute" 
          isActive={isMuted} 
          onPress={onToggleMute} 
          activeColor={Colors.danger} 
        />
        <ControlButton 
          icon="volume-2" 
          label="Speaker" 
          isActive={isSpeakerOn} 
          onPress={onToggleSpeaker} 
          activeColor={Colors.primary} 
        />
        <ControlButton 
          icon="grid" 
          label="Keypad" 
          isActive={isKeypadVisible} 
          onPress={() => setKeypadVisible(true)} 
          activeColor={Colors.primary} 
        />

        <ControlButton 
          icon="pause" 
          label="Hold" 
          isActive={isOnHold} 
          onPress={onToggleHold} 
          activeColor={Colors.warning} 
        />
        <ControlButton 
          icon="circle" 
          label="Record" 
          isActive={isRecording} 
          onPress={onToggleRecord} 
          activeColor={Colors.danger} 
        />
        <ControlButton 
          icon="plus" 
          label="Add Call" 
          isActive={false} 
          onPress={() => {}} 
          activeColor={Colors.secondary}
          disabled={true} 
        />
      </View>

      {/* DTMF Keypad Modal */}
      <Modal
        visible={isKeypadVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setKeypadVisible(false)}
      >
        <View style={styles.modalOverlay}>
           <SafeAreaView style={styles.modalContent}>
              <TouchableOpacity 
                className="absolute top-4 right-6 p-2 z-10"
                onPress={() => setKeypadVisible(false)}
              >
                  <Ionicons name="close-circle" size={32} color={Colors.textMuted} />
              </TouchableOpacity>

              <View className="items-center pt-8 mb-4">
                  <Text className="text-textMuted text-xs uppercase tracking-[4px]">DTMF Digits</Text>
                  <Text className="text-textPrimary text-4xl font-bold mt-2 h-12">
                    {dtmfDigits}
                  </Text>
              </View>

              <DialPad onKeyPress={handleKeyPress} />
              
              <TouchableOpacity 
                className="mt-10 py-4 px-10 rounded-full border border-primary/30"
                onPress={() => { setDtmfDigits(''); setKeypadVisible(false); }}
              >
                  <Text className="text-primary font-bold">DISMISS KEYPAD</Text>
              </TouchableOpacity>
           </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 15, 20, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  }
});

export default memo(CallControls);
