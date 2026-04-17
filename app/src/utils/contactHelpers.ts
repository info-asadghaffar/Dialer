import { Contact } from '../types/contact.types';

/**
 * Predefined gradient pairs for contact avatars.
 */
export const AVATAR_COLORS = [
  ['#00D4FF', '#7B61FF'], ['#00E676', '#00B0FF'],
  ['#FF6B6B', '#FF8E53'], ['#A855F7', '#EC4899'],
  ['#F59E0B', '#EF4444'], ['#10B981', '#3B82F6'],
  ['#6366F1', '#D946EF'], ['#F97316', '#F43F5E'],
  ['#8B5CF6', '#3B82F6'], ['#14B8A6', '#06B6D4'],
];

/**
 * Returns the first letter of first and last name as initials.
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0] ? parts[0][0].toUpperCase() : '?';
};

/**
 * Searches for a contact that matches a specific phone number.
 */
export const getContactByNumber = (number: string, contacts: Contact[]): Contact | undefined => {
  return contacts.find(c => 
    c.phoneNumbers.some(p => p.number.replace(/\D/g, '') === number.replace(/\D/g, ''))
  );
};

/**
 * Picks a random gradient pair from predefined list.
 */
export const generateAvatarColor = (): string[] => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

/**
 * Sorts contacts alphabetically by their name.
 */
export const sortContactsAlphabetically = (contacts: Contact[]): Contact[] => {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Groups contacts into a SectionList compatible format by first letter.
 */
export const groupContactsByLetter = (contacts: Contact[]): { title: string; data: Contact[] }[] => {
  const sorted = sortContactsAlphabetically(contacts);
  const groups: { [key: string]: Contact[] } = {};

  sorted.forEach(c => {
    const letter = c.name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  });

  return Object.keys(groups).sort().map(letter => ({
    title: letter,
    data: groups[letter],
  }));
};
