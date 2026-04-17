import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useMessages } from '../hooks/useMessages';
import { useSettingsStore } from '../store/settingsStore';
import MessageBubble from '../components/messages/MessageBubble';
import { formatDisplay } from '../utils/formatPhone';

/**
 * NexaDial Chat Screen for individual SMS conversations.
 */
const ChatScreen = () => {
    const route: any = useRoute();
    const navigation = useNavigation<any>();
    const { contactNumber } = route.params || { contactNumber: 'Unknown' };

    const [inputText, setInputText] = useState('');
    const { messages, sendMessage, isLoading } = useMessages(contactNumber);
    const settings = useSettingsStore((state) => state.settings);

    // Sort and invert for bottom-up list
    const invertedMessages = useMemo(() => {
        return [...messages].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        
        try {
            const body = inputText.trim();
            setInputText('');
            await sendMessage(settings?.primaryNumber || '', contactNumber, body);
        } catch (err: any) {
            Alert.alert('Send Failed', err.message);
        }
    };

    const handleCall = () => {
        navigation.navigate('Dialer', { autoDial: contactNumber });
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Custom Header */}
            <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2">
                    <Feather name="chevron-left" size={24} color={Colors.textMuted} />
                </TouchableOpacity>
                
                <View className="flex-1 flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-surfaceAlt border border-border items-center justify-center mr-3">
                        <Text className="text-primary font-black text-xs">
                          {contactNumber.charAt(2).toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-textPrimary font-bold text-base">
                          {formatDisplay(contactNumber)}
                        </Text>
                        <Text className="text-success text-[10px] uppercase font-black">Connected via Twilio</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    onPress={handleCall}
                    className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center border border-primary/20 mr-2"
                >
                    <Feather name="phone" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity className="w-10 h-10 items-center justify-center">
                    <Feather name="more-horizontal" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Chat List */}
            <FlatList
                data={invertedMessages}
                keyExtractor={(item) => item.messageSid}
                renderItem={({ item }) => (
                    <MessageBubble message={item} />
                )}
                inverted
                contentContainerStyle={{ paddingVertical: 20 }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 opacity-50">
                        <Text className="text-textMuted text-xs uppercase tracking-widest">End-to-End Encryption Enabled</Text>
                    </View>
                }
            />

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <View className="flex-row items-center px-4 py-4 bg-surface border-t border-border">
                    <TouchableOpacity className="mr-3 p-2 bg-surfaceAlt rounded-full border border-border">
                        <Feather name="paperclip" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                    
                    <View className="flex-1 bg-surfaceAlt rounded-3xl px-6 py-2 border border-border min-h-[48] justify-center">
                        <TextInput 
                            className="text-white text-base max-h-24"
                            placeholder="Type a message..."
                            placeholderTextColor={Colors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                    </View>

                    <TouchableOpacity 
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        className={`ml-3 w-12 h-12 rounded-full items-center justify-center border ${
                            inputText.trim() ? 'bg-primary border-primary' : 'bg-surfaceAlt border-border'
                        }`}
                    >
                        <Ionicons 
                            name="arrow-up" 
                            size={20} 
                            color={inputText.trim() ? Colors.background : Colors.textMuted} 
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;
