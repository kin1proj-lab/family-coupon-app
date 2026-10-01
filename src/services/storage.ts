import { User, Family, Coupon, FamilyInvite } from '../types';

const STORAGE_KEYS = {
  USERS: 'kupony_clean_users',
  CURRENT_USER_ID: 'kupony_clean_user_id',
  FAMILIES: 'kupony_clean_families',
  ACTIVE_FAMILY_ID: 'kupony_clean_active_family_id',
  COUPONS: 'kupony_clean_coupons',
  INVITES: 'kupony_clean_invites',
  LANG: 'kupony_lang_v2',
};

// Clean state: no pre-populated mock users, families or coupons
export const DEFAULT_USERS: User[] = [];
export const DEFAULT_FAMILIES: Family[] = [];
export const DEFAULT_COUPONS: Coupon[] = [];

export const StorageService = {
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getCurrentUser(): User | null {
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    return users.find((u) => u.id === currentId) || null;
  },

  setCurrentUser(userId: string | null) {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  },

  getFamilies(): Family[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FAMILIES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveFamilies(families: Family[]) {
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
  },

  getActiveFamilyId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_FAMILY_ID) || '';
  },

  setActiveFamilyId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FAMILY_ID, id);
  },

  getCoupons(): Coupon[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveCoupons(coupons: Coupon[]) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  },

  getInvites(): FamilyInvite[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVITES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveInvites(invites: FamilyInvite[]) {
    localStorage.setItem(STORAGE_KEYS.INVITES, JSON.stringify(invites));
  },

  resetAllData() {
    // Clear all old and new local storage keys
    localStorage.clear();
  },
};
