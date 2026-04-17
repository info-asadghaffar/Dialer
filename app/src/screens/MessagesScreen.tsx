import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useMessages } from '../hooks/useMessages';
import ConversationCard from '../components/messages/ConversationCard';
import { formatDisplay, formatE164 } from '../utils/formatPhone';

/**
 * NexaDial Messages Screen for list of SMS conversations.
 */
const MessagesScreen = () => {
    const navigation = useNavigation<any>();
    const { conversations } = useMessages();
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposeVisible, setIsComposeVisible] = useState(false);
    const [newNumber, setNewNumber] = useState('');

    const filteredConversations = useMemo(() => {
        if (!searchQuery) return conversations;
        return conversations.filter(c => 
            c.contactNumber.includes(searchQuery) || 
            c.lastMessage.body.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    const handleStartChat = () => {
        if (!newNumber) return;
        setIsComposeVisible(false);
        const formatted = formatE164(newNumber);
        navigation.navigate('Chat', { contactNumber: formatted });
        setNewNumber('');
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Text className="text-textPrimary text-3xl font-bold">Messages</Text>
                <TouchableOpacity 
                    onPress={() => setIsComposeVisible(true)}
                    className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center border border-primary/20"
                >
                    <Feather name="edit-3" size={18} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-6 mb-4">
                <View className="bg-surfaceAlt flex-row items-center px-4 h-12 rounded-xl border border-border">
                    <Feather name="search" size={16} color={Colors.textMuted} />
                    <TextInput 
                        className="flex-1 ml-3 text-white"
                        placeholder="Search conversations..."
                        placeholderTextColor={Colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Conversation List */}
            <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.contactNumber}
                renderItem={({ item }) => (
                    <ConversationCard 
                        conversation={item} 
                        onPress={() => navigation.navigate('Chat', { contactNumber: item.contactNumber })}
                    />
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-32 px-10">
                        <Ionicons name="chatbubbles-outline" size={64} color={Colors.textMuted} />
                        <Text className="text-textPrimary text-lg font-bold mt-4">No Messages</Text>
                        <Text className="text-textMuted text-center mt-2 px-6">
                            Start your first SMS conversation using the compose button above.
                        </Text>
                    </View>
                }
            />

            {/* Compose FAB */}
            <TouchableOpacity
                onPress={() => setIsComposeVisible(true)}
                className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30 border-4 border-background"
            >
                <Ionicons name="add" size={32} color={Colors.background} />
            </TouchableOpacity>

            {/* New Message Modal */}
            <Modal
                visible={isComposeVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsComposeVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    className="flex-1 justify-end bg-background/80"
                >
                    <View className="bg-surface border-t border-border rounded-t-3xl p-8 items-center h-[50%]">
                        <View className="w-12 h-1 bg-border rounded-full mb-8" />
                        <Text className="text-textPrimary text-xl font-bold mb-6">New Conversation</Text>
                        
                        <View className="w-full bg-surfaceAlt h-16 rounded-2xl px-6 border border-border flex-row items-center mb-6">
                           <Feather name="phone" size={20} color={Colors.textMuted} className="mr-3" />
                           <TextInput 
                              className="flex-1 text-white text-lg font-bold"
                              placeholder="+1 555 0199"
                              placeholderTextColor={Colors.textMuted}
                              value={newNumber}
                              onChangeText={setNewNumber}
                              keyboardType="phone-pad"
                              autoFocus={true}
                           />
                        </View>

                        <TouchableOpacity 
                           onPress={handleStartChat}
                           className="w-full bg-primary h-16 rounded-2xl items-center justify-center shadow-lg"
                        >
                           <Text className="text-background font-bold text-lg uppercase tracking-widest">Start Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                           onPress={() => setIsComposeVisible(false)}
                           className="mt-6"
                        >
                           <Text className="text-textMuted font-bold">CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default MessagesScreen;
