export type Language = 'en' | 'he';
export type ThemeMode = 'light' | 'dark' | 'system';

export type UserRole = 'owner' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarIcon?: string;
}

export interface FamilyMember {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  avatarIcon?: string;
}

export interface FamilyInvite {
  id: string;
  familyId: string;
  familyName: string;
  invitedEmail: string;
  invitedBy: string;
  invitedByName: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  emoji: string;
  createdAt: string;
  members: FamilyMember[];
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  userName: string;
  amountUsed: number;
  remainingAfter: number;
  usedAt: string; // ISO date
  note?: string;
}

export type CouponCategory =
  | 'groceries'
  | 'fashion'
  | 'dining'
  | 'electronics'
  | 'entertainment'
  | 'home'
  | 'travel'
  | 'other';

export interface Coupon {
  id: string;
  familyId: string;
  title: string;
  storeName: string;
  whereToUse: string; // text or URL (e.g., https://... or "Dizengoff Center Branch")
  code?: string;
  pin?: string;
  imageUrl?: string;
  barcodeType: 'CODE128' | 'QR' | 'NONE';
  initialValue: number;
  currentValue: number;
  currency: string; // '₪', '$', '€'
  expirationDate: string | null; // 'YYYY-MM-DD' or null
  category: CouponCategory;
  terms?: string;
  history: CouponUsage[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface FilterState {
  search: string;
  store: string;
  category: string;
  expiration: 'all' | 'active' | 'expiring_soon' | 'expired';
  valueRange: 'all' | 'under100' | '100to300' | 'over300';
  usageStatus: 'usable' | 'all' | 'unused' | 'partially_used' | 'fully_used';
  sortBy: 'expiry_asc' | 'expiry_desc' | 'value_desc' | 'value_asc' | 'created_desc' | 'store_asc';
}
