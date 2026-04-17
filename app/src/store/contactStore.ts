import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact } from '../types/contact.types';

interface ContactState {
  contacts: Contact[];
  isLoading: boolean;
  
  addContact: (contact: Contact) => void;
  updateContact: (id: string, partial: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const useContactStore = create<ContactState>()(
  persist(
    (set) => ({
      contacts: [],
      isLoading: false,

      addContact: (contact) => 
        set((state) => ({ 
          contacts: [...state.contacts, contact] 
        })),

      updateContact: (id, partial) => 
        set((state) => ({
          contacts: state.contacts.map(c => 
            c.id === id ? { ...c, ...partial } : c
          )
        })),

      deleteContact: (id) => 
        set((state) => ({
          contacts: state.contacts.filter(c => c.id !== id)
        })),

      toggleFavorite: (id) => 
        set((state) => ({
          contacts: state.contacts.map(c => 
            c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
          )
        })),
    }),
    {
      name: 'nexadial_contacts',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
