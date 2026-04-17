import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ActiveCallScreen from '../screens/ActiveCallScreen';
import IncomingCallScreen from '../screens/IncomingCallScreen';
import ChatScreen from '../screens/ChatScreen';
import AddContactScreen from '../screens/AddContactScreen';

const Stack = createNativeStackNavigator();

/**
 * Root Stack Navigator for the entire application.
 * Manages full-screen modals like calls and direct message chats.
 */
const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main App (Bottom Tabs) */}
      <Stack.Screen name="Main" component={BottomTabNavigator} />

      {/* Chat Interface (No Tab Bar) */}
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ animation: 'slide_from_right' }}
      />

      {/* Add/Edit Contact Modal */}
      <Stack.Screen 
        name="AddContact" 
        component={AddContactScreen} 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom' 
        }}
      />

      {/* Voip: Active Call (Force Full Screen) */}
      <Stack.Screen 
        name="ActiveCall" 
        component={ActiveCallScreen} 
        options={{ 
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: false // Prevent swiping away during call
        }}
      />

      {/* Voip: Incoming Call Overlay */}
      <Stack.Screen 
        name="IncomingCall" 
        component={IncomingCallScreen} 
        options={{ 
          presentation: 'transparentModal',
          animation: 'fade',
          gestureEnabled: false
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
