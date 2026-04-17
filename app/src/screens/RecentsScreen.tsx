import React, { useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  SectionList, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  TextInput, 
  RefreshControl, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../constants/colors';
import { useCallHistory } from '../hooks/useCallHistory';
import CallCard from '../components/calls/CallCard';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'missed', label: 'Missed' },
  { id: 'incoming', label: 'Incoming' },
  { id: 'outgoing', label: 'Outgoing' }
];

/**
 * NexaDial Recents Screen showing call history logs.
 */
const RecentsScreen = () => {
    const navigation = useNavigation<any>();
    
    // UI State
    const [filter, setFilter] = useState<any>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    
    // Animation
    const searchHeight = useRef(new Animated.Value(0)).current;

    // Data Hook
    const { 
        groupedCalls, 
        isLoading, 
        refetch, 
        deleteCall 
    } = useCallHistory(filter, searchQuery);

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
        Animated.timing(searchHeight, {
            toValue: isSearchVisible ? 0 : 48,
            duration: 250,
            useNativeDriver: false,
        }).start();
        if (isSearchVisible) setSearchQuery('');
    };

    const handleCallBack = (number: string) => {
        navigation.navigate('Dialer', { autoDial: number });
    };

    const renderSectionHeader = ({ section: { title } }: any) => (
        <View className="bg-background px-4 py-3 justify-center">
            <Text className="text-textMuted text-[10px] font-bold tracking-[3px] uppercase">
                {title}
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Text className="text-textPrimary text-3xl font-bold">Recents</Text>
                <TouchableOpacity 
                  onPress={toggleSearch}
                  className="w-10 h-10 bg-surfaceAlt rounded-full items-center justify-center border border-border"
                >
                    <Feather name={isSearchVisible ? 'x' : 'search'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Collapsible Search Bar */}
            <Animated.View style={[styles.searchContainer, { height: searchHeight }]}>
                <View className="flex-1 bg-surfaceAlt flex-row items-center px-4 rounded-xl border border-border mx-6">
                    <Feather name="search" size={16} color={Colors.textMuted} />
                    <TextInput 
                        className="flex-1 ml-3 text-white text-sm"
                        placeholder="Search by number..."
                        placeholderTextColor={Colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={isSearchVisible}
                    />
                </View>
            </Animated.View>

            {/* Filter Tabs */}
            <View className="h-14 mt-2">
                <ScrollView 
                   horizontal 
                   showsHorizontalScrollIndicator={false}
                   contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}
                >
                    {FILTERS.map((f) => (
                        <TouchableOpacity 
                          key={f.id}
                          onPress={() => setFilter(f.id)}
                          className={`px-6 py-2 rounded-full mr-3 border ${
                            filter === f.id ? 'bg-primary border-primary' : 'bg-transparent border-transparent'
                          }`}
                        >
                            <Text 
                                className={`text-xs font-bold uppercase tracking-wider ${
                                    filter === f.id ? 'text-background' : 'text-textMuted'
                                }`}
                            >
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Call List */}
            {isLoading && !groupedCalls.length ? (
                <View className="flex-1 items-center justify-center">
                   <ActivityIndicator color={Colors.primary} size="large" />
                </View>
            ) : (
                <SectionList
                    sections={groupedCalls}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CallCard 
                           call={item} 
                           onCallBack={handleCallBack} 
                           onDelete={() => deleteCall(item.id)}
                        />
                    )}
                    renderSectionHeader={renderSectionHeader}
                    stickySectionHeadersEnabled={false}
                    refreshControl={
                        <RefreshControl 
                           refreshing={isLoading} 
                           onRefresh={refetch} 
                           tintColor={Colors.primary} 
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-32 px-10">
                            <Ionicons name="time-outline" size={64} color={Colors.textMuted} />
                            <Text className="text-textPrimary text-lg font-bold mt-4">No History</Text>
                            <Text className="text-textMuted text-center mt-2">
                                Your recent calls will appear here. Try placing a call from the dialer.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        overflow: 'hidden',
        marginBottom: 8,
    }
});

export default RecentsScreen;
