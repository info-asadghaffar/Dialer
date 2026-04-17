import React, { memo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface ConnectionStatusProps {
  status: 'idle' | 'testing' | 'connected' | 'failed';
  lastVerifiedAt: string | null;
}

/**
 * Visual indicator to communicate Twilio API connectivity health.
 */
const ConnectionStatus = ({ status, lastVerifiedAt }: ConnectionStatusProps) => {

  const renderContent = () => {
    switch (status) {
      case 'testing':
        return (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text className="text-primary text-sm font-bold ml-3">Testing connection...</Text>
          </View>
        );
      case 'connected':
        return (
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <View className="ml-3">
              <Text className="text-success text-sm font-bold">Connected & Verified</Text>
              {lastVerifiedAt && (
                <Text className="text-textMuted text-[10px] mt-0.5">
                  Last verified: {new Date(lastVerifiedAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: '2-digit' })}
                </Text>
              )}
            </View>
          </View>
        );
      case 'failed':
        return (
          <View className="flex-row items-center">
            <Ionicons name="close-circle" size={24} color={Colors.danger} />
            <View className="ml-3">
              <Text className="text-danger text-sm font-bold">Connection Failed</Text>
              <Text className="text-textMuted text-[10px] mt-0.5">Check credentials and try again</Text>
            </View>
          </View>
        );
      default:
        return (
          <View className="flex-row items-center">
            <Ionicons name="ellipse-outline" size={24} color={Colors.textMuted} />
            <Text className="text-textMuted text-sm font-bold ml-3">Not Verified</Text>
          </View>
        );
    }
  };

  return (
    <View className="py-6 px-5 bg-surfaceAlt rounded-2xl border border-border mt-2 mb-6">
      {renderContent()}
    </View>
  );
};

export default memo(ConnectionStatus);
