import React, { useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet 
} from 'react-native';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { Colors } from '../constants/colors';
import { useContactStore } from '../store/contactStore';
import { generateAvatarColor } from '../utils/contactHelpers';
import { Contact, PhoneEntry, ContactLabel } from '../types/contact.types';

const LABELS: ContactLabel[] = ['mobile', 'work', 'home', 'other'];

/**
 * Add / Edit Contact Modal Screen.
 */
const AddContactScreen = () => {
    const navigation = useNavigation<any>();
    const route: any = useRoute();
    const { contactId, initialNumber } = route.params || {};

    const { contacts, addContact, updateContact } = useContactStore();
    
    // Find contact if we're in edit mode
    const contactToEdit = useMemo(() => 
        contacts.find(c => c.id === contactId), [contacts, contactId]
    );

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: contactToEdit?.name || '',
            email: contactToEdit?.email || '',
            notes: contactToEdit?.notes || '',
            phoneNumbers: contactToEdit?.phoneNumbers || [
                { number: initialNumber || '', label: 'mobile' as ContactLabel }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'phoneNumbers'
    });

    const onSubmit = (data: any) => {
        if (contactToEdit) {
            // Update mode
            updateContact(contactToEdit.id, data);
            Alert.alert('NexaDial', 'Contact updated successfully');
        } else {
            // Create mode
            const newContact: Contact = {
                id: uuidv4(),
                ...data,
                isFavorite: false,
                avatarColor: generateAvatarColor(),
                createdAt: new Date().toISOString()
            };
            addContact(newContact);
            Alert.alert('NexaDial', 'Contact saved successfully');
        }
        navigation.goBack();
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-border/20">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-textMuted font-bold">CANCEL</Text>
                </TouchableOpacity>
                <Text className="text-textPrimary text-xl font-bold">
                  {contactToEdit ? 'Edit Contact' : 'New Contact'}
                </Text>
                <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                    <Text className="text-primary font-bold uppercase tracking-widest">SAVE</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-8">
                {/* Basic Info */}
                <View className="mb-8">
                    <Text className="text-textMuted text-[10px] uppercase font-bold tracking-[3px] mb-3 ml-2">Main Info</Text>
                    <View className="bg-surfaceAlt p-4 rounded-2xl border border-border">
                        <Controller
                            control={control}
                            rules={{ required: true, minLength: 1 }}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center">
                                    <Feather name="user" size={18} color={Colors.textMuted} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-white text-base py-1"
                                        placeholder="Full Name"
                                        placeholderTextColor={Colors.textMuted}
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                </View>
                            )}
                        />
                        {errors.name && <Text className="text-danger text-[10px] mt-2 ml-7">Name is required</Text>}
                        
                        <View className="h-[1] bg-border my-4 mx-2" />

                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center">
                                    <Feather name="mail" size={18} color={Colors.textMuted} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-white text-base py-1"
                                        placeholder="Email Address (Optional)"
                                        placeholderTextColor={Colors.textMuted}
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="email-address"
                                    />
                                </View>
                            )}
                        />
                    </View>
                </View>

                {/* Phone Numbers List */}
                <View className="mb-8">
                    <Text className="text-textMuted text-[10px] uppercase font-bold tracking-[3px] mb-3 ml-2">Phone Numbers</Text>
                    {fields.map((field, index) => (
                        <View key={field.id} className="bg-surfaceAlt p-4 rounded-2xl border border-border mb-3 flex-row items-center">
                            <Controller
                                control={control}
                                rules={{ required: true }}
                                name={`phoneNumbers.${index}.number`}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput 
                                        className="flex-1 text-white text-base font-bold"
                                        placeholder="+1 555 0199"
                                        placeholderTextColor={Colors.textMuted}
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="phone-pad"
                                    />
                                )}
                            />
                            
                            <Controller
                                control={control}
                                name={`phoneNumbers.${index}.label`}
                                render={({ field: { onChange, value } }) => (
                                    <TouchableOpacity 
                                        className="px-3 py-1 bg-surface rounded-full border border-border flex-row items-center"
                                        onPress={() => {
                                            const currentIdx = LABELS.indexOf(value);
                                            const nextIdx = (currentIdx + 1) % LABELS.length;
                                            onChange(LABELS[nextIdx]);
                                        }}
                                    >
                                        <Text className="text-textSecondary text-[10px] uppercase font-black mr-1">{value}</Text>
                                        <Feather name="chevron-down" size={10} color={Colors.textMuted} />
                                    </TouchableOpacity>
                                )}
                            />

                            {fields.length > 1 && (
                                <TouchableOpacity onPress={() => remove(index)} className="ml-3 p-1">
                                    <Feather name="minus-circle" size={18} color={Colors.danger} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity 
                        onPress={() => append({ number: '', label: 'mobile' })}
                        className="flex-row items-center justify-center p-4 bg-primary/20 rounded-2xl border border-dashed border-primary/40 mt-1"
                    >
                        <Ionicons name="add-circle" size={20} color={Colors.primary} className="mr-2" />
                        <Text className="text-primary font-bold uppercase tracking-widest text-xs">Add phone number</Text>
                    </TouchableOpacity>
                </View>

                {/* Notes */}
                <View className="mb-20">
                    <Text className="text-textMuted text-[10px] uppercase font-bold tracking-[3px] mb-3 ml-2">Notes</Text>
                    <Controller
                        control={control}
                        name="notes"
                        render={({ field: { onChange, value } }) => (
                            <View className="bg-surfaceAlt p-4 rounded-2xl border border-border min-h-32">
                                <TextInput 
                                    className="flex-1 text-white text-base text-top"
                                    placeholder="Add notes for this contact..."
                                    placeholderTextColor={Colors.textMuted}
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                />
                            </View>
                        )}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddContactScreen;
