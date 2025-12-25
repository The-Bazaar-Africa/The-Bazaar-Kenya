export type UserRole = 'user' | 'vendor' | 'vendor_staff' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  addresses?: Address[];
  preferences?: UserPreferences;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  currency: string;
  language: string;
}

