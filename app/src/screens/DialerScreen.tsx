import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/colors';
import { useTwilioDevice } from '../hooks/useTwilioDevice';
import { useSettingsStore } from '../store/settingsStore';
import { formatE164, isValidPhoneNumber } from '../utils/formatPhone';

import DialPad from '../components/dialer/DialPad';
import DialDisplay from '../components/dialer/DialDisplay';
import CallButton from '../components/dialer/CallButton';

/**
 * NexaDial Primary Dialer Screen.
 */
const DialerScreen = () => {
  const navigation = useNavigation<any>();
  const [dialedNumber, setDialedNumber] = useState('');
  const { makeCall, isLoading } = useTwilioDevice();
  const settings = useSettingsStore((state) => state.settings);
  
  // Handlers for dialing
  const handleKeyPress = useCallback((key: string) => {
    setDialedNumber((prev) => {
      if (prev.length >= 15) return prev;
      return prev + key;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setDialedNumber((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setDialedNumber('');
  }, []);

  const handlePaste = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    // basic sanity check for numbers
    if (text) {
      setDialedNumber(text.replace(/[^\d+*#]/g, '').slice(0, 15));
    }
  }, []);

  const handleCallPress = useCallback(async () => {
    if (!dialedNumber) return;

    if (!isValidPhoneNumber(formatE164(dialedNumber))) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number in E.164 format.');
      return;
    }

    const formatted = formatE164(dialedNumber);
    try {
      await makeCall(formatted);
      navigation.navigate('ActiveCall', { 
        toNumber: formatted, 
        direction: 'outbound' 
      });
    } catch (err: any) {
      Alert.alert('Call Failed', err.message || 'Check your Twilio configuration.');
    }
  }, [dialedNumber, makeCall, navigation]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top: Active Twilio Number Pill */}
        <View className="items-center mb-6">
          <View className="bg-surfaceAlt flex-row items-center px-4 py-2 rounded-full border border-border">
            <View className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
            <Text className="text-textSecondary text-xs font-semibold">
              VIA {settings?.primaryNumber || 'SETUP REQUIRED'}
            </Text>
          </View>
        </View>

        {/* Middle: Number Display */}
        <DialDisplay 
          number={dialedNumber} 
          onDelete={handleDelete} 
          onClear={handleClear} 
          contactName={null} // TODO: lookup from contactsStore
        />

        {/* Dial Pad Component */}
        <DialPad onKeyPress={handleKeyPress} />

        {/* Bottom Call Controls Row */}
        <View className="flex-row items-center justify-between px-10 mt-12 w-full max-w-sm self-center">
          {/* Add Contact Icon */}
          <TouchableOpacity 
            className="w-12 h-12 bg-surface rounded-full items-center justify-center border border-border"
            onPress={() => navigation.navigate('Contacts')} // or a modal
          >
            <Ionicons name="person-add-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Core Call Action */}
          <CallButton 
            onPress={handleCallPress} 
            isLoading={isLoading} 
            disabled={dialedNumber.length === 0} 
          />

          {/* Paste Action */}
          <TouchableOpacity 
            className="w-12 h-12 bg-surface rounded-full items-center justify-center border border-border"
            onPress={handlePaste}
          >
            <Feather name="clipboard" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default DialerScreen;
