import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard React Error Boundary for NexaDial catching runtime UI crashes.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught Exception:', error, errorInfo);
  }

  handleRestart = () => {
    // Basic reload for RN (may require more robust solution like updates)
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View className="flex-1 items-center justify-center px-10">
            <Ionicons name="alert-circle" size={80} color={Colors.danger} />
            <Text className="text-white text-2xl font-black mt-8 text-center uppercase tracking-widest">
                Service Collision
            </Text>
            <Text className="text-textMuted text-center mt-4 text-base leading-6">
                NexaDial encountered an unexpected runtime error and cannot continue.
            </Text>

            <View className="bg-surfaceAlt p-4 rounded-2xl w-full border border-border mt-8">
               <Text className="text-danger text-xs font-mono">{this.state.error?.message}</Text>
            </View>

            <TouchableOpacity
                onPress={this.handleRestart}
                className="mt-12 bg-primary px-10 py-4 rounded-full shadow-lg shadow-primary/30"
            >
                <Text className="text-background font-black uppercase tracking-widest">Restart Environment</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
});

export default ErrorBoundary;
