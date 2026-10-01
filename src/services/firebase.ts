import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
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
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Coupon, Family, FamilyInvite, User } from '../types';
import { DEFAULT_USERS, DEFAULT_FAMILIES, DEFAULT_COUPONS } from './storage';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
    // Connected to server (even if document not found, connection is live)
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

export const CloudStorageService = {
  // Initialize Cloud Database with seed data if empty
  async seedInitialDataIfNeeded(): Promise<void> {
    try {
      const familiesSnapshot = await getDocs(collection(db, COLLECTIONS.FAMILIES));
      if (familiesSnapshot.empty) {
        // Seed default families
        for (const fam of DEFAULT_FAMILIES) {
          await setDoc(doc(db, COLLECTIONS.FAMILIES, fam.id), fam);
        }
        // Seed default coupons
        for (const coup of DEFAULT_COUPONS) {
          await setDoc(doc(db, COLLECTIONS.COUPONS, coup.id), coup);
        }
        // Seed default users
        for (const u of DEFAULT_USERS) {
          await setDoc(doc(db, COLLECTIONS.USERS, u.id), u);
        }
        console.log('Firestore seeded successfully with initial family coupon data.');
      }
    } catch (err) {
      console.error('Seed error:', err);
    }
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
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.COUPONS);
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
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.FAMILIES);
      }
    );
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
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.INVITES);
      }
    );
  },

  // Save / Update a coupon in Cloud Firestore
  async saveCoupon(coupon: Coupon): Promise<void> {
    const path = `${COLLECTIONS.COUPONS}/${coupon.id}`;
    try {
      await setDoc(doc(db, COLLECTIONS.COUPONS, coupon.id), coupon);
    } catch (err) {
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
      await setDoc(doc(db, COLLECTIONS.FAMILIES, family.id), family);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Save / Update an invite in Cloud Firestore
  async saveInvite(invite: FamilyInvite): Promise<void> {
    const path = `${COLLECTIONS.INVITES}/${invite.id}`;
    try {
      await setDoc(doc(db, COLLECTIONS.INVITES, invite.id), invite);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },
};
