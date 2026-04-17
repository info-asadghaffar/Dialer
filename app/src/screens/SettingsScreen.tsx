import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';
import { settingsService } from '../services/settingsService';
import CredentialInput from '../components/settings/CredentialInput';
import PhoneNumberCard from '../components/settings/PhoneNumberCard';
import ConnectionStatus from '../components/settings/ConnectionStatus';
import { useToast } from '../components/common/Toast';

/**
 * NexaDial Settings Management Screen.
 */
const SettingsScreen = () => {
    const { settings, setSettings } = useSettingsStore();
    const { showToast } = useToast();
    
    // UI State for editing
    const [localSettings, setLocalSettings] = useState<any>(settings || {});
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    const updateField = (field: string, value: any) => {
        setLocalSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleTestConnection = async () => {
        setConnectionStatus('testing');
        try {
            const result = await settingsService.testConnection({
                account_sid: localSettings.account_sid,
                auth_token: localSettings.auth_token
            });
            
            if (result.success) {
                setConnectionStatus('connected');
                showToast(`Connected: ${result.accountName}`, 'success');
            } else {
                setConnectionStatus('failed');
                showToast('Connection failed', 'error');
            }
        } catch (err) {
            setConnectionStatus('failed');
            showToast('Test failed', 'error');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const saved = await settingsService.saveSettings(localSettings);
            setSettings(saved);
            showToast('Settings saved successfully', 'success');
        } catch (err) {
            showToast('Failed to save settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearData = () => {
        Alert.alert('NexaDial', 'Clear all local data and configurations?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear All', onPress: () => {}, style: 'destructive' }
        ]);
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <Text className="text-primary text-[10px] font-black tracking-[4px] uppercase px-6 pt-10 pb-4">
            {title}
        </Text>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-6 flex-row items-center justify-between border-b border-border/20">
                <Text className="text-textPrimary text-3xl font-bold">Settings</Text>
                <TouchableOpacity 
                   onPress={handleSave}
                   disabled={isSaving}
                   className="px-6 py-2 bg-primary rounded-full items-center justify-center border-4 border-background"
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color={Colors.background} />
                    ) : (
                        <Text className="text-background font-black uppercase text-xs tracking-widest">Update</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                
                {/* TWILIO CREDENTIALS SECTION */}
                <SectionHeader title="Twilio Credentials" />
                <View className="px-6">
                    <CredentialInput 
                        label="Account SID" 
                        value={localSettings.account_sid} 
                        onChangeText={(t) => updateField('account_sid', t)}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <CredentialInput 
                        label="Auth Token" 
                        value={localSettings.auth_token} 
                        onChangeText={(t) => updateField('auth_token', t)}
                        isSecret={true}
                        placeholder="your_auth_token"
                    />
                    <CredentialInput 
                        label="API Key" 
                        value={localSettings.api_key} 
                        onChangeText={(t) => updateField('api_key', t)}
                        placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <CredentialInput 
                        label="API Secret" 
                        value={localSettings.api_secret} 
                        onChangeText={(t) => updateField('api_secret', t)}
                        isSecret={true}
                    />
                    <CredentialInput 
                        label="TwiML App SID" 
                        value={localSettings.twiml_app_sid} 
                        onChangeText={(t) => updateField('twiml_app_sid', t)}
                        placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        hint="Required for Voice SDK Outgoing Calls"
                    />

                    <ConnectionStatus 
                        status={connectionStatus} 
                        lastVerifiedAt={localSettings.last_verified_at} 
                    />

                    <TouchableOpacity 
                        onPress={handleTestConnection}
                        className="w-full py-4 rounded-xl border border-primary/40 items-center mb-10"
                    >
                        <Text className="text-primary font-bold uppercase tracking-widest text-xs">Test Live Connection</Text>
                    </TouchableOpacity>
                </View>

                {/* PHONE NUMBERS SECTION */}
                <SectionHeader title="Phone Numbers" />
                <View className="px-6">
                    {localSettings.phoneNumbers?.map((num: any) => (
                        <PhoneNumberCard 
                           key={num.number}
                           number={num} 
                           onDelete={() => {}} 
                           onSetPrimary={() => {}} 
                        />
                    ))}
                    
                    <TouchableOpacity 
                        className="flex-row items-center justify-center p-4 bg-surfaceAlt border border-dashed border-border rounded-2xl mt-2"
                    >
                        <Ionicons name="add-circle-outline" size={20} color={Colors.textMuted} className="mr-2" />
                        <Text className="text-textMuted font-bold text-xs uppercase">Provision New Number</Text>
                    </TouchableOpacity>
                    <Text className="text-textMuted text-[10px] italic mt-3 px-2">
                        Numbers must be purchased and active in your Twilio Console to function.
                    </Text>
                </View>

                {/* CALL SETTINGS SECTION */}
                <SectionHeader title="Call Control" />
                <View className="px-6 space-y-3">
                    <View className="flex-row items-center justify-between p-5 bg-surfaceAlt rounded-2xl border border-border">
                        <View>
                            <Text className="text-textPrimary font-bold">Incoming Calls</Text>
                            <Text className="text-textMuted text-[10px] mt-1">Accept calls at nexadial-user identity</Text>
                        </View>
                        <Switch 
                            value={localSettings.allow_incoming} 
                            onValueChange={(v) => updateField('allow_incoming', v)}
                            trackColor={{ false: Colors.border, true: Colors.success }}
                        />
                    </View>

                    <View className="flex-row items-center justify-between p-5 bg-surfaceAlt rounded-2xl border border-border mt-3">
                        <View>
                            <Text className="text-textPrimary font-bold">Call Recording</Text>
                            <Text className="text-textMuted text-[10px] mt-1">Both parties will be notified at start</Text>
                        </View>
                        <Switch 
                            value={localSettings.call_recording} 
                            onValueChange={(v) => updateField('call_recording', v)}
                            trackColor={{ false: Colors.border, true: Colors.success }}
                        />
                    </View>
                </View>

                {/* NOTIFICATIONS SECTION */}
                <SectionHeader title="Alerts" />
                <View className="px-6 space-y-3">
                     {[
                        { label: 'Incoming Call Alerts', key: 'notify_calls' },
                        { label: 'Missed Call Alerts', key: 'notify_missed' },
                        { label: 'SMS Notifications', key: 'notify_sms' }
                     ].map((item, idx) => (
                        <View key={item.key} className={`flex-row items-center justify-between p-5 bg-surfaceAlt rounded-2xl border border-border ${idx > 0 ? 'mt-3' : ''}`}>
                            <Text className="text-textPrimary font-bold">{item.label}</Text>
                            <Switch 
                                value={true}
                                trackColor={{ false: Colors.border, true: Colors.primary }}
                            />
                        </View>
                     ))}
                </View>

                {/* ABOUT SECTION */}
                <SectionHeader title="About" />
                <View className="px-6 pb-20">
                    <View className="bg-surfaceAlt rounded-2xl border border-border overflow-hidden">
                        <View className="flex-row items-center justify-between p-5 border-b border-border/40">
                            <Text className="text-textSecondary">App Version</Text>
                            <Text className="text-textPrimary font-bold">1.0.0 (Production)</Text>
                        </View>
                        <View className="flex-row items-center justify-between p-5 border-b border-border/40">
                            <Text className="text-textSecondary">Backend Cluster</Text>
                            <Text className="text-primary font-bold text-xs">CONNECTED</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={handleClearData}
                            className="flex-row items-center justify-center p-5"
                        >
                            <Ionicons name="trash-outline" size={18} color={Colors.danger} className="mr-2" />
                            <Text className="text-danger font-black uppercase text-xs tracking-widest">Clear Local Environment</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;
