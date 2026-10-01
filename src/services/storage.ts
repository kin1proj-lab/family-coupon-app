import { User, Family, Coupon, FamilyInvite } from '../types';

const STORAGE_KEYS = {
  USERS: 'kupony_users_v2',
  CURRENT_USER_ID: 'kupony_current_user_id_v2',
  FAMILIES: 'kupony_families_v2',
  ACTIVE_FAMILY_ID: 'kupony_active_family_id_v2',
  COUPONS: 'kupony_coupons_v2',
  INVITES: 'kupony_invites_v2',
  LANG: 'kupony_lang_v2',
};

// Default initial state
export const DEFAULT_USERS: User[] = [
  {
    id: 'user-kin',
    name: 'Kin (Owner)',
    email: 'kin1proj@gmail.com',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'user-maya',
    name: 'Maya',
    email: 'maya.family@gmail.com',
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'user-daniel',
    name: 'Daniel',
    email: 'daniel.teen@gmail.com',
    avatarColor: 'bg-sky-500',
  },
  {
    id: 'user-grandpa',
    name: 'Grandpa David',
    email: 'david.grandpa@gmail.com',
    avatarColor: 'bg-indigo-500',
  },
];

export const DEFAULT_FAMILIES: Family[] = [
  {
    id: 'fam-cohen',
    name: 'Cohen Family (משפחת כהן)',
    ownerId: 'user-kin',
    emoji: '🏡',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    members: [
      {
        userId: 'user-kin',
        name: 'Kin (Owner)',
        email: 'kin1proj@gmail.com',
        role: 'owner',
        joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        userId: 'user-maya',
        name: 'Maya',
        email: 'maya.family@gmail.com',
        role: 'member',
        joinedAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      },
      {
        userId: 'user-daniel',
        name: 'Daniel',
        email: 'daniel.teen@gmail.com',
        role: 'member',
        joinedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'fam-grandparents',
    name: 'Grandparents Club (משפחת סבא וסבתא)',
    ownerId: 'user-grandpa',
    emoji: '👴',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    members: [
      {
        userId: 'user-grandpa',
        name: 'Grandpa David',
        email: 'david.grandpa@gmail.com',
        role: 'owner',
        joinedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
      {
        userId: 'user-kin',
        name: 'Kin',
        email: 'kin1proj@gmail.com',
        role: 'member',
        joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ],
  },
];

// Helper to format ISO date to YYYY-MM-DD
function addDays(days: number): string {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    familyId: 'fam-cohen',
    title: 'Shufersal Supermarket Gift Card',
    storeName: 'Shufersal Deal',
    whereToUse: 'https://www.shufersal.co.il',
    code: 'SHUF-9921-8840',
    pin: '4481',
    barcodeType: 'CODE128',
    initialValue: 300,
    currentValue: 180, // Exactly the user's example: 300 shekels, 120 used, 180 remaining!
    currency: '₪',
    expirationDate: addDays(18),
    category: 'groceries',
    terms: 'Valid at all branches and online store. Excludes cigarettes.',
    history: [
      {
        id: 'hist-1',
        couponId: 'coup-1',
        userId: 'user-maya',
        userName: 'Maya',
        amountUsed: 120,
        remainingAfter: 180,
        usedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        note: 'Weekly grocery basket at Shufersal Dizengoff',
      },
    ],
    createdBy: 'user-kin',
    createdByName: 'Kin (Owner)',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    isFavorite: true,
  },
  {
    id: 'coup-2',
    familyId: 'fam-cohen',
    title: 'Zara Fashion Gift Voucher',
    storeName: 'Zara',
    whereToUse: 'TLV Fashion Mall & Ramat Aviv Mall',
    code: 'ZR-5510-7389-99',
    pin: '9012',
    barcodeType: 'CODE128',
    initialValue: 400,
    currentValue: 400,
    currency: '₪',
    expirationDate: addDays(4), // Expiring soon (<7 days)
    category: 'fashion',
    terms: 'Present digital barcode to cashier before payment. Non-refundable.',
    history: [],
    createdBy: 'user-kin',
    createdByName: 'Kin (Owner)',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    isFavorite: true,
  },
  {
    id: 'coup-3',
    familyId: 'fam-cohen',
    title: 'Aroma Coffee & Pastry Pass',
    storeName: 'Aroma Espresso Bar',
    whereToUse: 'https://www.aroma.co.il',
    code: 'AROMA-8820-KUP',
    barcodeType: 'QR',
    initialValue: 100,
    currentValue: 65,
    currency: '₪',
    expirationDate: addDays(40),
    category: 'dining',
    terms: 'Valid at all branches across Israel and Aroma pickup app.',
    history: [
      {
        id: 'hist-2',
        couponId: 'coup-3',
        userId: 'user-daniel',
        userName: 'Daniel',
        amountUsed: 35,
        remainingAfter: 65,
        usedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        note: 'Ice aroma and halloumi sandwich on study break',
      },
    ],
    createdBy: 'user-maya',
    createdByName: 'Maya',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'coup-4',
    familyId: 'fam-cohen',
    title: 'Fox Home Furnishings Voucher',
    storeName: 'Fox Home',
    whereToUse: 'https://www.foxhome.co.il',
    code: 'FXH-1049-9231',
    barcodeType: 'CODE128',
    initialValue: 250,
    currentValue: 0, // Fully redeemed
    currency: '₪',
    expirationDate: addDays(60),
    category: 'home',
    terms: 'Includes Dream Card points.',
    history: [
      {
        id: 'hist-3',
        couponId: 'coup-4',
        userId: 'user-kin',
        userName: 'Kin (Owner)',
        amountUsed: 250,
        remainingAfter: 0,
        usedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        note: 'Bought new bedding set and dinner plates',
      },
    ],
    createdBy: 'user-kin',
    createdByName: 'Kin (Owner)',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'coup-photo-1',
    familyId: 'fam-cohen',
    title: 'Castro Fashion Digital Card',
    storeName: 'Castro',
    whereToUse: 'Dizengoff Center & TLV Mall',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    barcodeType: 'NONE',
    initialValue: 200,
    currentValue: 200,
    currency: '₪',
    expirationDate: addDays(35),
    category: 'fashion',
    terms: 'Show image at cash register for direct barcode scanner checkout.',
    history: [],
    createdBy: 'user-maya',
    createdByName: 'Maya',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'coup-5',
    familyId: 'fam-cohen',
    title: 'Steimatzky Books & Board Games',
    storeName: 'Steimatzky',
    whereToUse: 'https://www.steimatzky.co.il',
    code: 'STM-7712-4091',
    pin: '8310',
    barcodeType: 'CODE128',
    initialValue: 150,
    currentValue: 150,
    currency: '₪',
    expirationDate: addDays(-3), // Expired!
    category: 'entertainment',
    terms: 'Valid on Hebrew and English books.',
    history: [],
    createdBy: 'user-daniel',
    createdByName: 'Daniel',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'coup-6',
    familyId: 'fam-grandparents',
    title: 'Super-Pharm Care Voucher',
    storeName: 'Super-Pharm',
    whereToUse: 'https://shop.super-pharm.co.il',
    code: 'SP-9911-2034',
    barcodeType: 'CODE128',
    initialValue: 200,
    currentValue: 140,
    currency: '₪',
    expirationDate: addDays(25),
    category: 'groceries',
    terms: 'Valid for cosmetics, pharmacy and baby products.',
    history: [
      {
        id: 'hist-4',
        couponId: 'coup-6',
        userId: 'user-grandpa',
        userName: 'Grandpa David',
        amountUsed: 60,
        remainingAfter: 140,
        usedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        note: 'Vitamins and sun cream',
      },
    ],
    createdBy: 'user-grandpa',
    createdByName: 'Grandpa David',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

export const StorageService = {
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  },

  getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user-kin';
    return users.find((u) => u.id === currentId) || users[0];
  },

  setCurrentUser(userId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  getFamilies(): Family[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FAMILIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(DEFAULT_FAMILIES));
      return DEFAULT_FAMILIES;
    }
    return JSON.parse(raw);
  },

  saveFamilies(families: Family[]) {
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
  },

  getActiveFamilyId(): string {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_FAMILY_ID);
    if (active) return active;
    const families = this.getFamilies();
    const currentUserId = this.getCurrentUser().id;
    // Find first family user belongs to
    const userFamily = families.find((f) => f.members.some((m) => m.userId === currentUserId));
    const fallbackId = userFamily ? userFamily.id : families[0]?.id || 'fam-cohen';
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FAMILY_ID, fallbackId);
    return fallbackId;
  },

  setActiveFamilyId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FAMILY_ID, id);
  },

  getCoupons(): Coupon[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
    }
    return JSON.parse(raw);
  },

  saveCoupons(coupons: Coupon[]) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  },

  getInvites(): FamilyInvite[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVITES);
    if (!raw) return [];
    return JSON.parse(raw);
  },

  saveInvites(invites: FamilyInvite[]) {
    localStorage.setItem(STORAGE_KEYS.INVITES, JSON.stringify(invites));
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.FAMILIES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_FAMILY_ID);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.removeItem(STORAGE_KEYS.INVITES);
  },
};
