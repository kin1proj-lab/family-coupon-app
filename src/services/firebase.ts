import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Coupon, Family, FamilyInvite, User } from '../types';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  { ignoreUndefinedProperties: true },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);

// Helper to remove any undefined fields before sending to Firestore
export function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanPayload(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanPayload(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as specified in the Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or initializing.');
      return false;
    }
    return true;
  }
}

// Collections in Firestore
const COLLECTIONS = {
  USERS: 'users',
  FAMILIES: 'families',
  COUPONS: 'coupons',
  INVITES: 'invites',
};

// Generate consistent avatar color based on name/email
export function getAvatarColor(identifier: string): string {
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
  ];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const AuthService = {
  // Listen to Firebase Auth state
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const user: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          avatarColor: getAvatarColor(fbUser.email || fbUser.uid),
        };
        // Upsert user profile to Firestore
        try {
          await setDoc(
            doc(db, COLLECTIONS.USERS, user.id),
            {
              id: user.id,
              name: user.name,
              email: user.email,
              avatarColor: user.avatarColor,
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn('User profile sync error:', e);
        }
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  // Sign in with Google (Gmail)
  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const user: User = {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      email: fbUser.email || '',
      avatarColor: getAvatarColor(fbUser.email || fbUser.uid),
    };
    await setDoc(
      doc(db, COLLECTIONS.USERS, user.id),
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return user;
  },

  // Sign in with Email and Password
  async signInWithEmail(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const fbUser = cred.user;
    const user: User = {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      email: fbUser.email || '',
      avatarColor: getAvatarColor(fbUser.email || fbUser.uid),
    };
    return user;
  },

  // Register with Email, Password & Name
  async signUpWithEmail(email: string, pass: string, name: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const fbUser = cred.user;
    if (name.trim()) {
      await updateProfile(fbUser, { displayName: name.trim() });
    }
    const user: User = {
      id: fbUser.uid,
      name: name.trim() || fbUser.email?.split('@')[0] || 'User',
      email: fbUser.email || '',
      avatarColor: getAvatarColor(fbUser.email || fbUser.uid),
    };
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
    return user;
  },

  // Sign Out
  async signOut(): Promise<void> {
    await signOut(auth);
  },
};

export const CloudStorageService = {
  // Clean database initialization (no mock data seeded)
  async seedInitialDataIfNeeded(): Promise<void> {
    // No mock seed
  },

  // Real-time listener for coupons
  subscribeToCoupons(onUpdate: (coupons: Coupon[]) => void) {
    const colRef = collection(db, COLLECTIONS.COUPONS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Coupon[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Coupon);
        });
        onUpdate(list);
      },
      (error) => {
        console.error('Coupons subscribe error:', error);
      }
    );
  },

  // Real-time listener for families
  subscribeToFamilies(onUpdate: (families: Family[]) => void) {
    const colRef = collection(db, COLLECTIONS.FAMILIES);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Family[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Family);
        });
        onUpdate(list);
      },
      (error) => {
        console.error('Families subscribe error:', error);
      }
    );
  },

  // Get a single family directly by ID
  async getFamily(familyId: string): Promise<Family | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.FAMILIES, familyId));
      if (snap.exists()) {
        return snap.data() as Family;
      }
      return null;
    } catch (err) {
      console.warn('getFamily error:', err);
      return null;
    }
  },

  // Real-time listener for invites
  subscribeToInvites(onUpdate: (invites: FamilyInvite[]) => void) {
    const colRef = collection(db, COLLECTIONS.INVITES);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: FamilyInvite[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as FamilyInvite);
        });
        onUpdate(list);
      },
      (error) => {
        console.error('Invites subscribe error:', error);
      }
    );
  },

  // Save / Update a coupon in Cloud Firestore
  async saveCoupon(coupon: Coupon): Promise<void> {
    const path = `${COLLECTIONS.COUPONS}/${coupon.id}`;
    try {
      const sanitized = cleanPayload(coupon);
      await setDoc(doc(db, COLLECTIONS.COUPONS, coupon.id), sanitized, { merge: true });
    } catch (err) {
      console.error('saveCoupon Firestore error:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Delete a coupon in Cloud Firestore
  async deleteCoupon(couponId: string): Promise<void> {
    const path = `${COLLECTIONS.COUPONS}/${couponId}`;
    try {
      await deleteDoc(doc(db, COLLECTIONS.COUPONS, couponId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // Save / Update a family in Cloud Firestore
  async saveFamily(family: Family): Promise<void> {
    const path = `${COLLECTIONS.FAMILIES}/${family.id}`;
    try {
      const sanitized = cleanPayload(family);
      await setDoc(doc(db, COLLECTIONS.FAMILIES, family.id), sanitized, { merge: true });
    } catch (err) {
      console.error('saveFamily Firestore error:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Delete a family AND all its coupons from Cloud Firestore
  async deleteFamily(familyId: string): Promise<void> {
    try {
      // 1. Delete all coupons belonging to this family
      const q = query(collection(db, COLLECTIONS.COUPONS), where('familyId', '==', familyId));
      const snaps = await getDocs(q);
      for (const d of snaps.docs) {
        await deleteDoc(doc(db, COLLECTIONS.COUPONS, d.id));
      }
      // 2. Delete family document
      await deleteDoc(doc(db, COLLECTIONS.FAMILIES, familyId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.FAMILIES}/${familyId}`);
    }
  },

  // Save / Update an invite in Cloud Firestore
  async saveInvite(invite: FamilyInvite): Promise<void> {
    const path = `${COLLECTIONS.INVITES}/${invite.id}`;
    try {
      const sanitized = cleanPayload(invite);
      await setDoc(doc(db, COLLECTIONS.INVITES, invite.id), sanitized, { merge: true });
    } catch (err) {
      console.error('saveInvite Firestore error:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Save / Update user profile in Cloud Firestore
  async saveUser(user: User): Promise<void> {
    const path = `${COLLECTIONS.USERS}/${user.id}`;
    try {
      const sanitized = cleanPayload(user);
      await setDoc(doc(db, COLLECTIONS.USERS, user.id), sanitized, { merge: true });
    } catch (err) {
      console.error('saveUser Firestore error:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },
};
