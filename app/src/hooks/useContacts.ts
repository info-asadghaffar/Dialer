import { useMemo } from 'react';
import { useContactStore } from '../store/contactStore';
import { groupContactsByLetter } from '../utils/contactHelpers';
import { Contact } from '../types/contact.types';

/**
 * Filtered and grouped contacts for use in ContactsScreen.
 */
export const useContacts = (searchQuery: string = '') => {
  const { contacts } = useContactStore();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.phoneNumbers.some(p => p.number.includes(query))
    );
  }, [contacts, searchQuery]);

  const favorites = useMemo(() => {
    return contacts.filter(c => c.isFavorite);
  }, [contacts]);

  const grouped = useMemo(() => {
    return groupContactsByLetter(filtered);
  }, [filtered]);

  return {
    contacts,
    favorites,
    grouped,
    count: contacts.length,
    filteredCount: filtered.length
  };
};
