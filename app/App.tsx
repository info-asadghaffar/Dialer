import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { ToastProvider } from './src/components/common/Toast';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { useAppInit } from './src/hooks/useAppInit';
import { Colors } from './src/constants/colors';

/**
 * PRODUCTION QUERY CLIENT CONFIGURATION
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * NexaDial Application Root.
 * Manages all global providers, error boundaries, and app-wide state orchestration.
 */
export default function App() {
  const { isReady, initError } = useAppInit();

  useEffect(() => {
    async function hideSplash() {
      if (isReady) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplash();
  }, [isReady]);

  if (!isReady) {
    // Return early if not ready, or a standard splash-view
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <NavigationContainer ref={navigationRef}>
                <RootNavigator />
              </NavigationContainer>
            </ToastProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
});
