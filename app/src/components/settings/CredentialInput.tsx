import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useToast } from '../common/Toast';

interface CredentialInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isSecret?: boolean;
  placeholder?: string;
  hint?: string;
}

/**
 * Styled credential input for secure credential display and editing.
 */
const CredentialInput = ({ 
  label, 
  value, 
  onChangeText, 
  isSecret = false, 
  placeholder, 
  hint 
}: CredentialInputProps) => {
  const [showSecret, setShowSecret] = useState(!isSecret);
  const { showToast } = useToast();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    showToast('Copied to clipboard', 'info');
  };

  return (
    <View className="mb-5">
      <Text className="text-textMuted text-[10px] uppercase font-black tracking-widest mb-2 ml-1">
        {label}
      </Text>
      
      <View className="bg-surfaceAlt flex-row items-center px-4 rounded-xl border border-border focus:border-primary">
        <TextInput
          className="flex-1 py-4 text-white text-sm"
          style={styles.monoFont}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isSecret && !showSecret}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isSecret && (
          <TouchableOpacity 
             onPress={() => setShowSecret(!showSecret)}
             className="p-2"
          >
            <Feather name={showSecret ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
           onPress={handleCopy}
           className="p-2"
        >
          <Feather name="copy" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {hint && (
        <Text className="text-textMuted text-[10px] mt-2 italic px-1">
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  monoFont: {
    fontFamily: 'JetBrainsMono_400Regular', // Consistent monospaced SID/token font
    letterSpacing: -0.5,
  },
});

export default CredentialInput;
