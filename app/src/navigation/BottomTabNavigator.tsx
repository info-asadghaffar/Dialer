import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import DialerScreen from '../screens/DialerScreen'
import RecentsScreen from '../screens/RecentsScreen'
import MessagesScreen from '../screens/MessagesScreen'
import ContactsScreen from '../screens/ContactsScreen'
import SettingsScreen from '../screens/SettingsScreen'
import { Colors } from '../constants/colors'
import { Ionicons } from '@expo/vector-icons'

const Tab = createBottomTabNavigator()

/**
 * Bottom Tab Navigator for primary app sections.
 */
const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    height: 85,
                    paddingBottom: 25,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                headerStyle: {
                    backgroundColor: Colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTitleStyle: {
                    color: Colors.textPrimary,
                    fontSize: 20,
                    fontWeight: 'bold',
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help'

                    if (route.name === 'Dialer') iconName = 'keypad-outline'
                    else if (route.name === 'Recents') iconName = 'time-outline'
                    else if (route.name === 'Messages') iconName = 'chatbubble-outline'
                    else if (route.name === 'Contacts') iconName = 'people-outline'
                    else if (route.name === 'Settings') iconName = 'settings-outline'

                    return <Ionicons name={iconName} size={size} color={color} />
                },
            })}
        >
            <Tab.Screen name="Dialer" component={DialerScreen} />
            <Tab.Screen name="Recents" component={RecentsScreen} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
            <Tab.Screen name="Contacts" component={ContactsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    )
}

export default BottomTabNavigator
