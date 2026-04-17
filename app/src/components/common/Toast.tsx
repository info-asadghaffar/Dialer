import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Global Toast System for NexaDial using Animated API.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const animation = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    Animated.timing(animation, {
      toValue: -120,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
        setToast(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    });
  }, [animation]);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    if (toast) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    setToast({ message, type, duration });
    
    Animated.timing(animation, {
      toValue: 20, // Slide down beneath safe area
      duration: 400,
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(hideToast, duration);
  }, [toast, animation, hideToast]);

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success': return Colors.success;
      case 'error': return Colors.danger;
      case 'warning': return Colors.warning;
      case 'info': return Colors.primary;
      default: return Colors.surface;
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'alert-triangle';
      default: return 'info';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View 
          style={[
            styles.container, 
            { 
              transform: [{ translateY: animation }],
              backgroundColor: getBackgroundColor(toast.type),
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={hideToast}
            className="flex-row items-center px-5 py-3 rounded-2xl shadow-xl"
          >
            <Feather name={getIcon(toast.type)} size={20} color="white" />
            <Text className="text-white text-sm font-bold ml-3 flex-1">{toast.message}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40, // Anchor below physical notch
    left: 20,
    right: 20,
    borderRadius: 20,
    zIndex: 9999,
    elevation: 10,
  },
});
