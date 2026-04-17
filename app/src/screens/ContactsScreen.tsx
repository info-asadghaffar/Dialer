import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  SectionList, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Animated, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../constants/colors';
import { useContacts } from '../hooks/useContacts';
import { useContactStore } from '../store/contactStore';
import { getInitials, formatDisplay } from '../utils/contactHelpers';
import { Contact } from '../types/contact.types';

/**
 * NexaDial Contacts Management Screen.
 */
const ContactsScreen = () => {
    const navigation = useNavigation<any>();
    const { contacts, favorites, grouped } = useContacts();
    const { deleteContact, toggleFavorite } = useContactStore();

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    
    // Animation refs
    const searchHeight = useRef(new Animated.Value(0)).current;

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
        Animated.timing(searchHeight, {
            toValue: isSearchVisible ? 0 : 48,
            duration: 250,
            useNativeDriver: false,
        }).start();
        if (isSearchVisible) setSearchQuery('');
    };

    const handleCall = (number: string) => {
        navigation.navigate('Dialer', { autoDial: number });
    };

    const handleSms = (number: string) => {
        navigation.navigate('Messages', { screen: 'Chat', params: { contactNumber: number }});
    };

    const handleLongPress = (contact: Contact) => {
        Alert.alert(
            contact.name,
            'Manage this contact record',
            [
                { text: 'Edit Contact', onPress: () => navigation.navigate('AddContact', { contactId: contact.id }) },
                { text: contact.isFavorite ? 'Remove from Favorites' : 'Add to Favorites', onPress: () => toggleFavorite(contact.id) },
                { text: 'Delete Contact', onPress: () => deleteContact(contact.id), style: 'destructive' },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const renderContactRow = ({ item }: { item: Contact }) => {
        const primaryNumber = item.phoneNumbers[0]?.number || 'No number';
        
        return (
            <TouchableOpacity 
                activeOpacity={0.7}
                onLongPress={() => handleLongPress(item)}
                onPress={() => navigation.navigate('AddContact', { contactId: item.id })}
                className="flex-row items-center px-6 py-4 bg-surface border-b border-border/30"
            >
                {/* Avatar with Initials */}
                <LinearGradient
                    colors={item.avatarColor as string[]}
                    className="w-10 h-10 rounded-full items-center justify-center border border-border"
                >
                    <Text className="text-white text-sm font-black">
                        {getInitials(item.name)}
                    </Text>
                </LinearGradient>

                {/* Name & Number */}
                <View className="flex-1 ml-4 justify-center">
                    <Text className="text-textPrimary text-[15px] font-bold">{item.name}</Text>
                    <Text className="text-textMuted text-xs mt-0.5">{formatDisplay(primaryNumber)}</Text>
                </View>

                {/* Actions */}
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        onPress={() => handleSms(primaryNumber)}
                        className="w-8 h-8 rounded-full bg-surfaceAlt items-center justify-center border border-border mr-3"
                    >
                        <Feather name="message-square" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleCall(primaryNumber)}
                        className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center border border-primary/20"
                    >
                        <Feather name="phone" size={14} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = ({ section: { title } }: any) => (
        <View className="bg-background px-6 py-2">
            <Text className="text-primary text-[11px] font-black tracking-[4px]">{title}</Text>
        </View>
    );

    const renderFavorites = () => {
        if (!favorites.length) return null;
        return (
            <View className="py-6 border-b border-border/20">
                <Text className="text-textMuted text-[10px] font-black tracking-[4px] uppercase ml-6 mb-4">Favorites</Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={favorites}
                    keyExtractor={(item) => `fav-${item.id}`}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            className="items-center mr-6"
                            onPress={() => handleCall(item.phoneNumbers[0].number)}
                        >
                            <LinearGradient
                                colors={item.avatarColor as string[]}
                                className="w-14 h-14 rounded-full items-center justify-center border-4 border-surface shadow-lg"
                            >
                                <Text className="text-white text-lg font-black">{getInitials(item.name)}</Text>
                            </LinearGradient>
                            <Text className="text-textSecondary text-[10px] font-bold mt-2 uppercase tracking-tight">
                                {item.name.split(' ')[0]}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Text className="text-textPrimary text-3xl font-bold">Contacts</Text>
                <View className="flex-row">
                    <TouchableOpacity 
                        onPress={toggleSearch}
                        className="w-10 h-10 bg-surfaceAlt rounded-full items-center justify-center border border-border mr-3"
                    >
                        <Feather name={isSearchVisible ? 'x' : 'search'} size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('AddContact')}
                        className="w-10 h-10 bg-primary items-center justify-center rounded-full border-4 border-background"
                    >
                        <Ionicons name="add" size={24} color={Colors.background} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Collapsible Search */}
            <Animated.View style={[styles.searchContainer, { height: searchHeight }]}>
                <View className="flex-1 bg-surfaceAlt flex-row items-center px-4 h-12 rounded-xl border border-border mx-6">
                    <Feather name="search" size={16} color={Colors.textMuted} />
                    <TextInput 
                        className="flex-1 ml-3 text-white"
                        placeholder="Filter by name or number..."
                        placeholderTextColor={Colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </Animated.View>

            {/* Main Contact List */}
            <SectionList
                sections={grouped}
                keyExtractor={(item) => item.id}
                renderItem={renderContactRow}
                renderSectionHeader={renderSectionHeader}
                ListHeaderComponent={renderFavorites}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-32 px-10">
                        <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
                        <Text className="text-textPrimary text-lg font-bold mt-4">Safe Directory Empty</Text>
                        <Text className="text-textMuted text-center mt-2">
                            Add your first contact to start communicating securely via Twilio.
                        </Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('AddContact')}
                            className="mt-8 px-8 py-3 bg-primary rounded-full items-center"
                        >
                            <Text className="text-background font-bold tracking-widest uppercase text-xs">Create Contact</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        overflow: 'hidden',
        marginBottom: 8,
    }
});

export default ContactsScreen;
