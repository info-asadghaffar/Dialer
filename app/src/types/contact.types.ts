export type ContactLabel = 'mobile' | 'work' | 'home' | 'other';

export interface PhoneEntry {
  number: string; // E.164
  label: ContactLabel;
}

export interface Contact {
  id: string; // uuid generated locally
  name: string;
  phoneNumbers: PhoneEntry[];
  email?: string;
  notes?: string;
  isFavorite: boolean;
  avatarColor: string[]; // Gradent pair: [start, end]
  createdAt: string;
}
