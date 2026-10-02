import React, { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Sparkles,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Coupon,
  Family,
  FamilyInvite,
  FilterState,
  Language,
  ThemeMode,
  User,
} from './types';
import { StorageService } from './services/storage';
import {
  CloudStorageService,
  testFirestoreConnection,
  AuthService,
} from './services/firebase';
import { getTranslation } from './i18n/translations';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { CouponCard } from './components/CouponCard';
import { CouponDetailModal } from './components/CouponDetailModal';
import { RedeemModal } from './components/RedeemModal';
import { AddEditCouponModal } from './components/AddEditCouponModal';
import { QuickAddModal } from './components/QuickAddModal';
import { FamilyManageModal } from './components/FamilyManageModal';
import { LoginPage } from './components/LoginPage';
import { OnboardingNoFamilyScreen } from './components/OnboardingNoFamilyScreen';
import { UserSettingsModal } from './components/UserSettingsModal';
import { compressImage } from './utils/imageCompressor';

export default function App() {
  const [lang, setLang] = useState<Language>('he');
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem('kupony_theme') as ThemeMode) || 'light'
  );
  const t = getTranslation(lang);
  const isHe = lang === 'he';

  // Auth & Core data states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [activeFamilyId, setActiveFamilyId] = useState<string>('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [invites, setInvites] = useState<FamilyInvite[]>([]);

  // Modals state
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [redeemingCoupon, setRedeemingCoupon] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isManageFamiliesOpen, setIsManageFamiliesOpen] = useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);

  // Sync dark class on document element
  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kupony_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Default Filter: ONLY show usable coupons
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    store: 'all',
    category: 'all',
    expiration: 'all',
    valueRange: 'all',
    usageStatus: 'usable',
    sortBy: 'expiry_asc',
  });

  // 1. Listen to Firebase Authentication state
  useEffect(() => {
    const unsubAuth = AuthService.onAuthStateChange((user) => {
      if (user) {
        setCurrentUser(user);
        StorageService.setCurrentUser(user.id);
      } else {
        const localUser = StorageService.getCurrentUser();
        if (localUser) {
          setCurrentUser(localUser);
        } else {
          setCurrentUser(null);
        }
      }
      setAuthInitialized(true);
    });
    return () => unsubAuth();
  }, []);

  // 2. Initialize and load from local storage & Firestore real-time sync
  useEffect(() => {
    // Load cached families & coupons
    const loadedFamilies = StorageService.getFamilies();
    const loadedActiveFamId = StorageService.getActiveFamilyId();
    const loadedCoupons = StorageService.getCoupons();
    const loadedInvites = StorageService.getInvites();

    setFamilies(loadedFamilies);
    setActiveFamilyId(loadedActiveFamId);
    setCoupons(loadedCoupons);
    setInvites(loadedInvites);

    // Test Firestore connection & seed if newly provisioned
    testFirestoreConnection().then((connected) => {
      if (connected) {
        CloudStorageService.seedInitialDataIfNeeded();
      }
    });

    const unsubCoupons = CloudStorageService.subscribeToCoupons((cloudCoupons) => {
      setCoupons((prev) => {
        const cloudIds = new Set(cloudCoupons.map((c) => c.id));
        // Keep all local coupons that haven't appeared in cloudCoupons yet
        const unsyncedLocal = prev.filter((c) => !cloudIds.has(c.id));

        // Background auto-sync for any local coupon not in cloud
        unsyncedLocal.forEach((unsynced) => {
          CloudStorageService.saveCoupon(unsynced).catch((err) => {
            console.warn('Auto-sync unsynced coupon failed:', err);
          });
        });

        const merged = [...unsyncedLocal, ...cloudCoupons];
        StorageService.saveCoupons(merged);
        return merged;
      });
    });

    const unsubFamilies = CloudStorageService.subscribeToFamilies((cloudFamilies) => {
      setFamilies(cloudFamilies);
      StorageService.saveFamilies(cloudFamilies);
    });

    const unsubInvites = CloudStorageService.subscribeToInvites((cloudInvites) => {
      setInvites(cloudInvites);
      StorageService.saveInvites(cloudInvites);
    });

    return () => {
      unsubCoupons();
      unsubFamilies();
      unsubInvites();
    };
  }, []);

  // Update HTML dir and lang
  useEffect(() => {
    document.documentElement.dir = isHe ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isHe]);

  // AUTHORIZATION: Only show families that the current user belongs to or owns
  const visibleFamilies = useMemo(() => {
    if (!currentUser) return [];
    return families.filter((f) => {
      // 1. Owner of family
      if (f.ownerId === currentUser.id) return true;
      // 2. Member by ID
      if (f.members && f.members.some((m) => m.userId === currentUser.id)) return true;
      // 3. Member by matching Email (case-insensitive)
      if (
        currentUser.email &&
        f.members &&
        f.members.some(
          (m) => m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()
        )
      ) {
        return true;
      }
      // 4. Member who accepted an invite to this family
      if (
        currentUser.email &&
        invites.some(
          (inv) =>
            inv.familyId === f.id &&
            inv.status === 'accepted' &&
            inv.invitedEmail.toLowerCase() === currentUser.email.toLowerCase()
        )
      ) {
        return true;
      }
      return false;
    });
  }, [families, currentUser, invites]);

  // Ensure active family is valid and belongs to the authorized visibleFamilies
  useEffect(() => {
    if (!currentUser) return;
    if (visibleFamilies.length > 0) {
      if (!visibleFamilies.some((f) => f.id === activeFamilyId)) {
        setActiveFamilyId(visibleFamilies[0].id);
      }
    }
  }, [visibleFamilies, activeFamilyId, currentUser]);

  // Active Family object (strictly within authorized visibleFamilies)
  const activeFamily = useMemo(() => {
    if (visibleFamilies.length === 0) return null;
    return visibleFamilies.find((f) => f.id === activeFamilyId) || visibleFamilies[0];
  }, [visibleFamilies, activeFamilyId]);

  // Coupons for active family
  const familyCoupons = useMemo(() => {
    if (!activeFamily) return [];
    return coupons.filter((c) => c.familyId === activeFamily.id);
  }, [coupons, activeFamily]);

  // Unique stores for the filter dropdown
  const uniqueStores = useMemo(() => {
    const stores = new Set<string>();
    familyCoupons.forEach((c) => {
      if (c.storeName) stores.add(c.storeName);
    });
    return Array.from(stores).sort();
  }, [familyCoupons]);

  // Filtered & Sorted coupons
  const displayedCoupons = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return familyCoupons
      .filter((c) => {
        // Search
        if (filters.search) {
          const s = filters.search.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(s);
          const matchStore = c.storeName.toLowerCase().includes(s);
          const matchCode = c.code ? c.code.toLowerCase().includes(s) : false;
          if (!matchTitle && !matchStore && !matchCode) return false;
        }

        // Store
        if (filters.store !== 'all' && c.storeName !== filters.store) {
          return false;
        }

        // Category
        if (filters.category !== 'all' && c.category !== filters.category) {
          return false;
        }

        // Value Range
        if (filters.valueRange !== 'all') {
          if (filters.valueRange === 'under100' && c.currentValue >= 100) return false;
          if (
            filters.valueRange === '100to300' &&
            (c.currentValue < 100 || c.currentValue > 300)
          )
            return false;
          if (filters.valueRange === 'over300' && c.currentValue <= 300) return false;
        }

        // Expiration
        if (c.expirationDate) {
          const exp = new Date(c.expirationDate);
          exp.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));

          if (filters.expiration === 'active' && diffDays < 0) return false;
          if (filters.expiration === 'expiring_soon' && (diffDays < 0 || diffDays > 7))
            return false;
          if (filters.expiration === 'expired' && diffDays >= 0) return false;
        } else if (filters.expiration === 'expired') {
          return false;
        }

        // Usage Status
        if (filters.usageStatus === 'usable' && c.currentValue <= 0) return false;
        if (filters.usageStatus === 'unused' && c.currentValue !== c.initialValue) return false;
        if (
          filters.usageStatus === 'partially_used' &&
          (c.currentValue === c.initialValue || c.currentValue <= 0)
        )
          return false;
        if (filters.usageStatus === 'fully_used' && c.currentValue > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'expiry_asc') {
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return a.expirationDate.localeCompare(b.expirationDate);
        }
        if (filters.sortBy === 'expiry_desc') {
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return b.expirationDate.localeCompare(a.expirationDate);
        }
        if (filters.sortBy === 'value_desc') {
          return b.currentValue - a.currentValue;
        }
        if (filters.sortBy === 'value_asc') {
          return a.currentValue - b.currentValue;
        }
        if (filters.sortBy === 'created_desc') {
          return b.createdAt.localeCompare(a.createdAt);
        }
        if (filters.sortBy === 'store_asc') {
          return a.storeName.localeCompare(b.storeName);
        }
        return 0;
      });
  }, [familyCoupons, filters]);

  // Overall family balance statistics
  const stats = useMemo(() => {
    let totalAvailable = 0;
    let expiringCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    familyCoupons.forEach((c) => {
      totalAvailable += c.currentValue;
      if (c.currentValue > 0 && c.expirationDate) {
        const exp = new Date(c.expirationDate);
        exp.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          expiringCount++;
        }
      }
    });

    return {
      totalAvailable,
      count: familyCoupons.filter((c) => c.currentValue > 0).length,
      expiringCount,
    };
  }, [familyCoupons]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await AuthService.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  // Select active family
  const handleSelectFamily = (familyId: string) => {
    setActiveFamilyId(familyId);
    StorageService.setActiveFamilyId(familyId);
  };

  // Handle FAST FULL USE (⚡ Mark as fully used without popup!)
  const handleFastFullRedeem = (coupon: Coupon) => {
    if (!currentUser) return;
    if (coupon.currentValue <= 0) return;

    const amountUsed = coupon.currentValue;
    const usageEntry = {
      id: `usage-${Date.now()}`,
      couponId: coupon.id,
      userId: currentUser.id,
      userName: currentUser.name,
      amountUsed,
      remainingAfter: 0,
      usedAt: new Date().toISOString(),
      note: isHe ? 'שימוש מלא מהיר ⚡' : 'Fast Full Redemption ⚡',
    };

    const updatedCoupon: Coupon = {
      ...coupon,
      currentValue: 0,
      history: [usageEntry, ...(coupon.history || [])],
    };

    const updatedList = coupons.map((c) =>
      c.id === coupon.id ? updatedCoupon : c
    );

    setCoupons(updatedList);
    StorageService.saveCoupons(updatedList);
    CloudStorageService.saveCoupon(updatedCoupon);

    // CRITICAL: Close any open popups/modals immediately!
    setSelectedCoupon(null);
    setRedeemingCoupon(null);

    // Celebratory Confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
      });
    } catch {
      // Ignore if confetti is unavailable
    }
  };

  // Handle Partial or Full Deduction via Deduction Modal
  const handleRedeemCoupon = (
    couponId: string,
    amount: number,
    userId: string,
    note?: string
  ) => {
    const redeemingUser = currentUser!;
    let targetUpdatedCoupon: Coupon | null = null;

    const updated = coupons.map((c) => {
      if (c.id !== couponId) return c;
      const newBalance = Math.max(0, c.currentValue - amount);
      const usageEntry = {
        id: `usage-${Date.now()}`,
        couponId: c.id,
        userId: redeemingUser.id,
        userName: redeemingUser.name,
        amountUsed: amount,
        remainingAfter: newBalance,
        usedAt: new Date().toISOString(),
        note,
      };
      const updatedItem: Coupon = {
        ...c,
        currentValue: newBalance,
        history: [usageEntry, ...c.history],
      };
      targetUpdatedCoupon = updatedItem;
      return updatedItem;
    });

    setCoupons(updated);
    StorageService.saveCoupons(updated);
    if (targetUpdatedCoupon) {
      CloudStorageService.saveCoupon(targetUpdatedCoupon);
    }

    setRedeemingCoupon(null);
    setSelectedCoupon(null);
  };

  // Handle Undo Usage (Only for actions performed by currentUser!)
  const handleUndoUsage = (couponId: string, usageId: string) => {
    if (!currentUser) return;
    let targetUpdatedCoupon: Coupon | null = null;
    const updated = coupons.map((c) => {
      if (c.id !== couponId) return c;
      const targetUsage = c.history.find((h) => h.id === usageId);
      // Strictly allow reverting actions done by ME only
      if (!targetUsage || targetUsage.userId !== currentUser.id) return c;

      const restoredBalance = Math.min(
        c.initialValue,
        c.currentValue + targetUsage.amountUsed
      );
      const updatedItem: Coupon = {
        ...c,
        currentValue: restoredBalance,
        history: c.history.filter((h) => h.id !== usageId),
      };
      targetUpdatedCoupon = updatedItem;
      return updatedItem;
    });

    setCoupons(updated);
    StorageService.saveCoupons(updated);
    if (targetUpdatedCoupon) {
      CloudStorageService.saveCoupon(targetUpdatedCoupon);
    }

    if (selectedCoupon && selectedCoupon.id === couponId) {
      const fresh = updated.find((c) => c.id === couponId);
      if (fresh) setSelectedCoupon(fresh);
    }
  };

  // Handle Save (Add or Edit)
  const handleSaveCoupon = async (payload: Partial<Coupon>) => {
    if (!activeFamily) return;
    let savedCoupon: Coupon;
    if (editingCoupon) {
      savedCoupon = {
        ...editingCoupon,
        ...payload,
        familyId: activeFamily.id,
      } as Coupon;
      const updated = coupons.map((c) =>
        c.id === editingCoupon.id ? savedCoupon : c
      );
      setCoupons(updated);
      StorageService.saveCoupons(updated);
    } else {
      const newId = payload.id || `coup-${Date.now()}`;
      savedCoupon = {
        ...(payload as Coupon),
        id: newId,
        familyId: activeFamily.id,
        title: payload.title || '',
        storeName: payload.storeName || '',
        whereToUse: payload.whereToUse || payload.storeName || '',
        initialValue: Number(payload.initialValue || 0),
        currentValue: Number(payload.currentValue ?? payload.initialValue ?? 0),
        currency: payload.currency || '₪',
        category: payload.category || 'groceries',
        createdBy: payload.createdBy || currentUser?.id || 'unknown',
        createdByName: payload.createdByName || currentUser?.name || 'Member',
        createdAt: payload.createdAt || new Date().toISOString(),
        history: payload.history || [],
      };
      const updated = [savedCoupon, ...coupons];
      setCoupons(updated);
      StorageService.saveCoupons(updated);
    }

    // Safety: ensure any raw large image is compressed before sending to Firestore
    if (savedCoupon.imageUrl && savedCoupon.imageUrl.length > 300000) {
      try {
        savedCoupon.imageUrl = await compressImage(savedCoupon.imageUrl, 1024, 1024, 0.75);
      } catch (e) {
        console.warn('Compress on save warning:', e);
      }
    }

    // Close modals immediately
    setIsAddModalOpen(false);
    setIsQuickAddOpen(false);
    setEditingCoupon(null);
    setSelectedCoupon(null);

    // Sync to Cloud Firestore immediately
    try {
      await CloudStorageService.saveCoupon(savedCoupon);
    } catch (err) {
      console.error('Failed to sync coupon to Firestore:', err);
    }
  };

  // Handle Delete Coupon
  const handleDeleteCoupon = (couponId: string) => {
    const updated = coupons.filter((c) => c.id !== couponId);
    setCoupons(updated);
    StorageService.saveCoupons(updated);
    CloudStorageService.deleteCoupon(couponId);
    setSelectedCoupon(null);
    setRedeemingCoupon(null);
  };

  // Handle Create Family
  const handleCreateFamily = (name: string, emoji: string) => {
    if (!currentUser) return;
    const newFam: Family = {
      id: `fam-${Date.now()}`,
      name,
      ownerId: currentUser.id,
      emoji: emoji || '🏡',
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    const updated = [...families, newFam];
    setFamilies(updated);
    StorageService.saveFamilies(updated);
    CloudStorageService.saveFamily(newFam);

    setActiveFamilyId(newFam.id);
    StorageService.setActiveFamilyId(newFam.id);
    setIsManageFamiliesOpen(false);
  };

  // Handle Edit Family (Owner Feature)
  const handleEditFamily = (familyId: string, name: string, emoji: string) => {
    const updated = families.map((f) => {
      if (f.id !== familyId) return f;
      return { ...f, name, emoji };
    });
    setFamilies(updated);
    StorageService.saveFamilies(updated);
    const target = updated.find((f) => f.id === familyId);
    if (target) {
      CloudStorageService.saveFamily(target);
    }
  };

  // Handle Delete Family (Owner Feature)
  const handleDeleteFamily = (familyId: string) => {
    // 1. Delete coupons belonging to this family locally & from Cloud
    const remainingCoupons = coupons.filter((c) => c.familyId !== familyId);
    setCoupons(remainingCoupons);
    StorageService.saveCoupons(remainingCoupons);

    // 2. Delete family document
    const remainingFamilies = families.filter((f) => f.id !== familyId);
    setFamilies(remainingFamilies);
    StorageService.saveFamilies(remainingFamilies);

    // 3. Delete from Cloud Firestore
    CloudStorageService.deleteFamily(familyId);

    // 4. Select next authorized family if available
    const nextFam = remainingFamilies.find(
      (f) =>
        f.ownerId === currentUser?.id ||
        f.members.some((m) => m.userId === currentUser?.id)
    );
    if (nextFam) {
      setActiveFamilyId(nextFam.id);
      StorageService.setActiveFamilyId(nextFam.id);
    } else {
      setActiveFamilyId('');
      StorageService.setActiveFamilyId('');
    }

    // Close all open modals immediately
    setIsManageFamiliesOpen(false);
    setSelectedCoupon(null);
    setRedeemingCoupon(null);
  };

  // Handle Send Invite
  const handleSendInvite = (familyId: string, email: string) => {
    if (!currentUser || !activeFamily) return;
    const newInvite: FamilyInvite = {
      id: `inv-${Date.now()}`,
      familyId,
      familyName: activeFamily.name,
      invitedEmail: email.toLowerCase(),
      invitedBy: currentUser.id,
      invitedByName: currentUser.name,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const updated = [...invites, newInvite];
    setInvites(updated);
    StorageService.saveInvites(updated);
    CloudStorageService.saveInvite(newInvite);
  };

  // Handle Accept Invite
  const handleAcceptInvite = async (inviteId: string) => {
    if (!currentUser) return;
    const invite = invites.find((i) => i.id === inviteId);
    if (!invite) return;

    let targetUpdatedFamily: Family | null = null;
    const updatedFamilies = families.map((fam) => {
      if (fam.id !== invite.familyId) return fam;
      const alreadyMember = fam.members && fam.members.some(
        (m) =>
          m.userId === currentUser.id ||
          (currentUser.email && m.email?.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (alreadyMember) return fam;
      const updatedFam: Family = {
        ...fam,
        members: [
          ...(fam.members || []),
          {
            userId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: 'member' as const,
            joinedAt: new Date().toISOString(),
            avatarIcon: currentUser.avatarIcon,
          },
        ],
      };
      targetUpdatedFamily = updatedFam;
      return updatedFam;
    });

    const updatedInvite: FamilyInvite = { ...invite, status: 'accepted' as const };
    const updatedInvites = invites.map((i) =>
      i.id === inviteId ? updatedInvite : i
    );

    setFamilies(updatedFamilies);
    StorageService.saveFamilies(updatedFamilies);
    setInvites(updatedInvites);
    StorageService.saveInvites(updatedInvites);

    if (targetUpdatedFamily) {
      await CloudStorageService.saveFamily(targetUpdatedFamily);
    } else {
      // In case the family wasn't in local state yet, fetch directly and update
      try {
        const directFam = await CloudStorageService.getFamily(invite.familyId);
        if (directFam) {
          const alreadyMember = directFam.members && directFam.members.some(
            (m) =>
              m.userId === currentUser.id ||
              (currentUser.email && m.email?.toLowerCase() === currentUser.email.toLowerCase())
          );
          if (!alreadyMember) {
            const updatedFam: Family = {
              ...directFam,
              members: [
                ...(directFam.members || []),
                {
                  userId: currentUser.id,
                  name: currentUser.name,
                  email: currentUser.email,
                  role: 'member' as const,
                  joinedAt: new Date().toISOString(),
                  avatarIcon: currentUser.avatarIcon,
                },
              ],
            };
            await CloudStorageService.saveFamily(updatedFam);
          }
        }
      } catch (e) {
        console.warn('Direct family fetch/update error:', e);
      }
    }
    await CloudStorageService.saveInvite(updatedInvite);

    setActiveFamilyId(invite.familyId);
    StorageService.setActiveFamilyId(invite.familyId);
  };

  // Handle Decline Invite
  const handleDeclineInvite = (inviteId: string) => {
    const invite = invites.find((i) => i.id === inviteId);
    if (!invite) return;
    const updatedInvite: FamilyInvite = { ...invite, status: 'declined' as const };
    const updatedInvites = invites.map((i) =>
      i.id === inviteId ? updatedInvite : i
    );
    setInvites(updatedInvites);
    StorageService.saveInvites(updatedInvites);
    CloudStorageService.saveInvite(updatedInvite);
  };

  // Handle Save User Profile & Avatar Icon
  const handleSaveUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    StorageService.saveUser(updatedUser);
    CloudStorageService.saveUser(updatedUser);

    // Update avatarIcon and name across all families this user belongs to
    const updatedFamilies = families.map((fam) => {
      const hasMember = fam.members.some((m) => m.userId === updatedUser.id);
      if (!hasMember) return fam;
      const updatedFam: Family = {
        ...fam,
        members: fam.members.map((m) =>
          m.userId === updatedUser.id
            ? {
                ...m,
                name: updatedUser.name,
                avatarIcon: updatedUser.avatarIcon,
              }
            : m
        ),
      };
      CloudStorageService.saveFamily(updatedFam);
      return updatedFam;
    });

    setFamilies(updatedFamilies);
    StorageService.saveFamilies(updatedFamilies);
    setIsUserSettingsOpen(false);
  };

  // Show login page if user is not authenticated
  if (!currentUser) {
    return (
      <LoginPage
        lang={lang}
        onLanguageChange={setLang}
        onSuccess={(u) => setCurrentUser(u)}
      />
    );
  }

  // If user has no families yet: Show Onboarding Connection Screen
  if (visibleFamilies.length === 0) {
    return (
      <OnboardingNoFamilyScreen
        currentUser={currentUser}
        invites={invites}
        lang={lang}
        onLanguageChange={setLang}
        onLogout={handleLogout}
        onCreateFamily={handleCreateFamily}
        onAcceptInvite={handleAcceptInvite}
      />
    );
  }

  // Loading state if family is still initializing
  if (!activeFamily) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3 p-4">
        <div className="animate-spin text-blue-400">
          <Ticket className="w-10 h-10" />
        </div>
        <p className="text-sm text-slate-300 font-medium">
          {isHe ? 'טוען את הכספת המשפחתית שלך...' : 'Loading your family vault...'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20 selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors w-full max-w-full overflow-x-hidden"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Header with authenticated user badge and Logout button */}
      <Header
        families={visibleFamilies}
        activeFamily={activeFamily}
        currentUser={currentUser}
        lang={lang}
        theme={theme}
        onLanguageChange={setLang}
        onToggleTheme={handleToggleTheme}
        onSelectFamily={handleSelectFamily}
        onLogout={handleLogout}
        onOpenAddCoupon={() => setIsAddModalOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenManageFamilies={() => setIsManageFamiliesOpen(true)}
        onOpenUserSettings={() => setIsUserSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner with Family Summary & Value Stats */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/15">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-sky-300/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-sky-100 mb-2">
                <span>{activeFamily.emoji || '🏡'}</span>
                <span>{activeFamily.name}</span>
                <span>•</span>
                <span>
                  {activeFamily.members.length} {isHe ? 'בני משפחה שותפים' : 'family members'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isHe ? 'כספת השוברים והקופונים' : 'Family Coupon Vault'}
              </h2>
              <p className="text-sky-100 text-sm mt-1 max-w-xl">
                {isHe
                  ? 'שתפו קופונים עם כל המשפחה, עדכנו ניצול חלקי או מלא בזמן אמת, והציגו ברקוד או תמונה ישירות לקופאי/ת!'
                  : 'Share coupons across your family, record partial deductions, and scan barcodes or images directly at the cashier!'}
              </p>
            </div>

            {/* Quick Summary Cards & Fast Action */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Total Available Balance */}
              <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center min-w-[130px]">
                <div className="text-[11px] font-medium text-sky-100">
                  {t.totalSavings}
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5">
                  {stats.totalAvailable} <span className="text-lg font-bold">₪</span>
                </div>
              </div>

              {/* Total Active Usable Coupons */}
              <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center min-w-[110px]">
                <div className="text-[11px] font-medium text-sky-100">
                  {isHe ? 'קופונים פעילים' : 'Active Coupons'}
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5">
                  {stats.count}
                </div>
              </div>

              {/* Fast Quick Add Button in Hero */}
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="p-3.5 rounded-2xl bg-white text-blue-900 font-bold text-xs hover:bg-sky-50 shadow-md hover:scale-105 transition-all cursor-pointer flex flex-col items-center justify-center min-w-[90px]"
                title={t.quickAddTitle}
              >
                <Zap className="w-5 h-5 text-blue-600 fill-blue-600 mb-0.5" />
                <span>{t.quickAdd}</span>
              </button>
            </div>
          </div>

          {/* Expiring Soon Alert */}
          {stats.expiringCount > 0 && (
            <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="font-semibold text-white">
                  {isHe
                    ? `שים לב: ${stats.expiringCount} קופונים עומדים לפוג בשבוע הקרוב!`
                    : `Heads up: ${stats.expiringCount} coupon(s) expiring within the next 7 days!`}
                </span>
              </div>
              <button
                onClick={() => setFilters({ ...filters, expiration: 'expiring_soon' })}
                className="font-bold underline text-sky-100 hover:text-white cursor-pointer shrink-0"
              >
                {isHe ? 'הצג אותם' : 'Filter by soon'}
              </button>
            </div>
          )}
        </div>

        {/* Filters and Search Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          uniqueStores={uniqueStores}
          lang={lang}
        />

        {/* Coupons Grid with Fast Full Use and Partial Deduction */}
        {displayedCoupons.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8 rotate-12" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{t.emptyTitle}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t.emptySubtitle}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                <span>{t.quickAdd}</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addCoupon}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                lang={lang}
                onSelect={setSelectedCoupon}
                onRedeem={setRedeemingCoupon}
                onFastFullRedeem={handleFastFullRedeem}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal with Fast Full Use and Partial Deduction */}
      {selectedCoupon && (
        <CouponDetailModal
          coupon={selectedCoupon}
          currentUser={currentUser}
          lang={lang}
          isOpen={!!selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          onOpenRedeem={(c) => {
            setSelectedCoupon(null);
            setRedeemingCoupon(c);
          }}
          onFastFullRedeem={(c) => {
            handleFastFullRedeem(c);
            setSelectedCoupon(null);
          }}
          onOpenEdit={(c) => {
            setSelectedCoupon(null);
            setEditingCoupon(c);
          }}
          onDelete={(id) => {
            handleDeleteCoupon(id);
            setSelectedCoupon(null);
          }}
          onUndoUsage={handleUndoUsage}
        />
      )}

      {/* Redeem Modal (Full / Partial deduction with calculation) */}
      {redeemingCoupon && (
        <RedeemModal
          coupon={redeemingCoupon}
          family={activeFamily}
          currentUser={currentUser}
          lang={lang}
          isOpen={!!redeemingCoupon}
          onClose={() => {
            setRedeemingCoupon(null);
            setSelectedCoupon(null);
          }}
          onRedeem={handleRedeemCoupon}
        />
      )}

      {/* Add / Edit Coupon Full Modal */}
      {(isAddModalOpen || editingCoupon) && (
        <AddEditCouponModal
          coupon={editingCoupon}
          family={activeFamily}
          currentUser={currentUser}
          lang={lang}
          isOpen={isAddModalOpen || !!editingCoupon}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCoupon(null);
            setSelectedCoupon(null);
          }}
          onSave={handleSaveCoupon}
        />
      )}

      {/* Quick Add Fast Coupon Modal */}
      {isQuickAddOpen && (
        <QuickAddModal
          existingCoupons={coupons}
          family={activeFamily}
          currentUser={currentUser}
          lang={lang}
          isOpen={isQuickAddOpen}
          onClose={() => {
            setIsQuickAddOpen(false);
            setSelectedCoupon(null);
          }}
          onSave={handleSaveCoupon}
        />
      )}

      {/* Family Manage Modal with Edit and Delete options for Owner */}
      {isManageFamiliesOpen && (
        <FamilyManageModal
          families={visibleFamilies}
          activeFamily={activeFamily}
          currentUser={currentUser}
          invites={invites}
          lang={lang}
          isOpen={isManageFamiliesOpen}
          onClose={() => setIsManageFamiliesOpen(false)}
          onSelectFamily={(id) => {
            handleSelectFamily(id);
            setIsManageFamiliesOpen(false);
          }}
          onCreateFamily={(name, emoji) => {
            handleCreateFamily(name, emoji);
            setIsManageFamiliesOpen(false);
          }}
          onEditFamily={handleEditFamily}
          onDeleteFamily={(id) => {
            handleDeleteFamily(id);
            setIsManageFamiliesOpen(false);
          }}
          onSendInvite={handleSendInvite}
          onAcceptInvite={handleAcceptInvite}
          onDeclineInvite={handleDeclineInvite}
        />
      )}

      {/* User Settings & Avatar Icon Modal */}
      {isUserSettingsOpen && (
        <UserSettingsModal
          currentUser={currentUser}
          lang={lang}
          theme={theme}
          onThemeChange={setTheme}
          isOpen={isUserSettingsOpen}
          onClose={() => setIsUserSettingsOpen(false)}
          onSaveUser={handleSaveUser}
        />
      )}
    </div>
  );
}
